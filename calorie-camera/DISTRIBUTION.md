# CalorieCameraKit - Distribution Guide

**Version:** 1.0.0
**Author:** HabitPet Team
**Last Updated:** October 2025

---

## 🎯 Overview

CalorieCameraKit is a production-grade Swift Package for iOS that provides intelligent calorie estimation using:
- **Three-Path Routing**: Label (OCR), Menu (database), Geometry (LiDAR + VLM)
- **Delta Method Uncertainty Propagation**: Scientific uncertainty quantification
- **ARKit LiDAR Integration**: Depth-based volume estimation
- **OpenAI Vision Integration**: VLM-based food priors

---

## 📦 Installation

### Option A: From GitHub (Recommended)

CalorieCameraKit is part of the HabitPet monorepo. Swift Package Manager automatically detects packages in subfolders.

#### Using Xcode:
1. Open your project in Xcode
2. Go to **File → Add Package Dependencies...**
3. Enter the repository URL:
   ```
   https://github.com/Bingia01/habit_pet
   ```
4. Xcode will automatically detect the `calorie-camera` package
5. Select the version you want (e.g., `1.0.0` or `main` branch)
6. Click **Add Package**

#### Using Package.swift:
```swift
// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "YourApp",
    platforms: [
        .iOS(.v16)
    ],
    dependencies: [
        .package(url: "https://github.com/Bingia01/habit_pet", from: "1.0.0")
    ],
    targets: [
        .target(
            name: "YourApp",
            dependencies: [
                .product(name: "CalorieCameraKit", package: "habit_pet")
            ]
        )
    ]
)
```

### Option B: Local Package

If you have the ZIP file:

1. Extract `CalorieCameraKit-v1.0.0.zip`
2. In Xcode: **File → Add Local Package...**
3. Navigate to the extracted folder
4. Click **Add Package**

Or in Package.swift:
```swift
dependencies: [
    .package(path: "/path/to/CalorieCameraKit-v1.0.0")
]
```

---

## 🚀 Quick Start

### 1. Basic Integration

```swift
import SwiftUI
import CalorieCameraKit

struct ContentView: View {
    @State private var showCamera = false
    @State private var lastResult: CalorieResult?

    var body: some View {
        VStack {
            if let result = lastResult {
                Text("Calories: \(Int(result.total.mu)) ± \(Int(2 * result.total.sigma))")
                Text("Evidence: \(result.items.first?.evidence.joined(separator: ", ") ?? "")")
            }

            Button("Open Calorie Camera") {
                showCamera = true
            }
        }
        .fullScreenCover(isPresented: $showCamera) {
            CalorieCameraView(
                config: .development,  // Use .development for full features
                onResult: { result in
                    lastResult = result
                    showCamera = false
                },
                onCancel: {
                    showCamera = false
                }
            )
        }
    }
}
```

### 2. Camera Permissions

Add to your `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture food photos for calorie estimation</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to save captured images</string>
```

---

## 🔧 Backend Setup

**IMPORTANT:** CalorieCameraKit requires a backend API for the Label and Menu paths, and for VLM priors in the Geometry path.

See **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** for complete instructions on:
- Deploying the Supabase Edge Function
- Configuring OpenAI API access
- Setting up environment variables

### Quick Backend Summary:

1. **Deploy Supabase Function:**
   ```bash
   cd supabase
   supabase functions deploy analyze_food
   ```

2. **Configure in Your App:**
   ```swift
   // In your view:
   CalorieCameraView(
       config: .development,
       // ... rest of config
   )

   // The base URL is currently hardcoded in CalorieCameraView.swift:
   // baseURL = "https://YOUR_PROJECT.supabase.co/functions/v1"
   // apiKey = "YOUR_SUPABASE_ANON_KEY"
   ```

3. **Update Hardcoded Values:**
   Edit `CalorieCameraView.swift` around line 500:
   ```swift
   private static func makeAnalyzerClient() -> AnalyzerClient? {
       let baseURL = "https://YOUR_PROJECT.supabase.co/functions/v1"
       let apiKey = "YOUR_SUPABASE_ANON_KEY"
       // ...
   }
   ```

---

## 🏗️ Architecture

### Three-Path Router

CalorieCameraKit intelligently routes food images through three detection paths:

#### 1. **Label Path** (Packaged Foods)
- **When:** Food has visible nutrition label
- **Method:** OpenAI OCR to read nutrition facts
- **Accuracy:** ~5% uncertainty
- **Example:** Ritz crackers, protein bars, cereal boxes

#### 2. **Menu Path** (Restaurant Foods)
- **When:** Restaurant chain food detected
- **Method:** OpenAI knowledge of restaurant nutrition data
- **Accuracy:** ~10% uncertainty
- **Example:** Chipotle bowls, Subway sandwiches

#### 3. **Geometry Path** (Prepared Foods)
- **When:** Home-cooked or unpackaged food
- **Method:** LiDAR volume × OpenAI VLM priors
- **Formula:** `C = V × ρ × e`
- **Accuracy:** Varies (uses delta method)
- **Example:** Rice bowls, salads, pasta dishes

### Delta Method Uncertainty Propagation

For the Geometry path, uncertainty is scientifically propagated:

```
σ_C² = (∂C/∂V)² σ_V² + (∂C/∂ρ)² σ_ρ² + (∂C/∂e)² σ_e²
```

Where:
- `σ_V` = volume measurement uncertainty (from LiDAR)
- `σ_ρ` = density prior uncertainty (from VLM)
- `σ_e` = energy density uncertainty (from VLM)

---

## 📊 Configuration

### Development vs. Production Config

```swift
// Development config (recommended for testing)
CalorieCameraView(
    config: .development,  // Enables: router, VoI, logging
    // ...
)

// Production config (minimal features)
CalorieCameraView(
    config: .default,  // Only basic geometry estimation
    // ...
)
```

### Custom Configuration

```swift
let customConfig = CalorieConfig(
    targetRelSigma: 0.20,
    voiThreshold: 0.30,
    flags: FeatureFlags(
        routerEnabled: true,      // Enable three-path routing
        voiEnabled: true,          // Enable Value of Information prompts
        mixtureEnabled: false      // Disable mixture models
    ),
    correlationPenalty: 1.2
)

CalorieCameraView(config: customConfig, ...)
```

---

## 🧪 Testing

Run tests:
```bash
cd calorie-camera
swift test
```

Or in Xcode: **Product → Test** (⌘U)

---

## 🔍 Debugging

### Console Logs

The package includes extensive logging. Look for:
- `📦 RAW API RESPONSE:` - Backend JSON response
- `📐 Using VLM priors:` - Density and energy priors from OpenAI
- `🔀 ROUTER:` - Which path was chosen
- `✅ API SUCCESS!` - API call completed

### Common Issues

**1. API returns 401 Unauthorized**
- Check Supabase anon key is correct
- Verify both `apikey` and `Authorization` headers are set

**2. Calories show as millions**
- Router is disabled - use `.development` config, not `.default`

**3. No LiDAR depth data**
- Requires iPhone Pro models (12 Pro+) for LiDAR
- Falls back to default values on non-Pro devices

**4. API timeout**
- OpenAI Vision API can be slow (5-15 seconds)
- Check your OpenAI API key has quota

---

## 📝 Requirements

- iOS 16.0+
- Swift 5.9+
- Xcode 14.0+
- iPhone 12 Pro or later (for LiDAR depth sensing)

---

## 🤝 Support

For issues or questions:
1. Check [BACKEND_SETUP.md](./BACKEND_SETUP.md) for deployment help
2. Review console logs for error messages
3. Verify your OpenAI API key has quota
4. Contact the HabitPet team

---

## 📄 License

Proprietary - HabitPet © 2025
