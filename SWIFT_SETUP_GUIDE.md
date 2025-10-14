# Swift Camera Integration Setup Guide

This guide explains how to integrate the Swift-based CalorieCameraKit with your HabitPet app.

## 📁 Project Structure

```
habit_pet/
├── calorie-camera/                 # Swift Package (SPM)
│   ├── Package.swift              # Package manifest
│   ├── Sources/CalorieCameraKit/
│   │   ├── CaptureKit/           # Camera management
│   │   │   └── CameraManager.swift
│   │   ├── PerceptionKit/        # ML food detection
│   │   │   └── FoodDetector.swift
│   │   ├── NutritionKit/         # Nutrition database
│   │   │   └── NutritionDatabase.swift
│   │   ├── FusionKit/            # Data fusion
│   │   │   └── DataFusion.swift
│   │   ├── UXKit/                # UI components
│   │   │   └── CameraPreviewView.swift
│   │   └── CalorieCameraView.swift  # Main view
│   ├── Tests/CalorieCameraKitTests/
│   │   ├── FoodDetectorTests.swift
│   │   ├── NutritionDatabaseTests.swift
│   │   └── DataFusionTests.swift
│   └── README.md
│
├── calorie-camera-demo/          # Demo iOS app
│   ├── App/
│   │   ├── App.swift             # App entry point
│   │   ├── ContentView.swift     # Main UI
│   │   └── MockServices.swift    # Test data
│   ├── Config/
│   │   └── calorie-camera.json   # Configuration
│   └── README.md
│
└── src/                           # Your Next.js app
    ├── components/
    │   └── FinalCameraCapture.tsx  # Web camera (existing)
    └── pages/api/                  # Vercel API endpoints
        ├── priors/[foodKey].ts
        ├── barcode/[code].ts
        └── menu/search.ts
```

## 🎯 Architecture Overview

### Components

1. **CalorieCameraKit (Swift Package)**
   - Reusable iOS camera and ML components
   - Can be shared with your friend's Swift app
   - Supports iOS 16+ and macOS 13+

2. **Demo App**
   - Standalone iOS app showcasing the package
   - Testing ground for camera features
   - Reference implementation

3. **Web App (Existing)**
   - Next.js/React web interface
   - Browser-based camera using WebRTC
   - Shares backend API with Swift app

### Data Flow

```
iOS Camera → CalorieCameraKit → Food Detection → Data Fusion → Vercel API
                                                              ↓
Web Camera → React Component  → Food Analysis → API Call → Database
```

## 🚀 Quick Start

### Option 1: Run Demo App (Recommended First)

1. **Open Xcode** and create new iOS App project in `calorie-camera-demo/`
2. **Add Local Package**: File → Add Package Dependencies → Add Local → Select `calorie-camera/`
3. **Copy files**: The Swift files are already in `App/` directory
4. **Add permissions** to Info.plist (see demo README)
5. **Build and Run** on real device (camera needs hardware)

### Option 2: Add to Existing iOS Project

```swift
// In your existing iOS app's Package.swift:
dependencies: [
    .package(path: "../calorie-camera")
]

// Or in Xcode:
// File → Add Package Dependencies → Add Local → Select calorie-camera/
```

### Option 3: Use with React Native

If you want to use this in a React Native app:

1. Create a Native Module bridge
2. Expose CalorieCameraView through the bridge
3. Call from JavaScript

## 🔧 Integration Steps

### Step 1: Set Up Xcode Project

```bash
# Navigate to demo directory
cd calorie-camera-demo

# Open in Xcode (you'll create the project here)
open -a Xcode .
```

Create new iOS App project:
- **Product Name**: CalorieCameraDemoApp
- **Bundle ID**: com.habitpet.caloriecamera
- **Interface**: SwiftUI
- **Language**: Swift

### Step 2: Add CalorieCameraKit Package

In Xcode:
1. Select project in navigator
2. Click **Package Dependencies** tab
3. Click **+** button
4. Choose **Add Local...**
5. Navigate to and select `calorie-camera` folder
6. Click **Add Package**

### Step 3: Configure App

Add to `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture food photos</string>
```

### Step 4: Integrate with Backend

Update API endpoints in `Config/calorie-camera.json`:

```json
{
  "api": {
    "endpoints": {
      "priors": "https://habit-pet.vercel.app/api/priors/{foodKey}",
      "barcode": "https://habit-pet.vercel.app/api/barcode/{code}",
      "menu_search": "https://habit-pet.vercel.app/api/menu/search"
    }
  }
}
```

## 📱 Usage Examples

### Basic Integration

```swift
import SwiftUI
import CalorieCameraKit

struct MyView: View {
    @State private var showCamera = false

    var body: some View {
        Button("Scan Food") {
            showCamera = true
        }
        .fullScreenCover(isPresented: $showCamera) {
            CalorieCameraView(
                onFoodCaptured: { food in
                    print("Captured: \(food.foodName) - \(food.calories) cal")
                    showCamera = false
                },
                onDismiss: { showCamera = false }
            )
        }
    }
}
```

### Connect to Your API

```swift
func saveToBackend(food: EnrichedFoodData) async throws {
    let url = URL(string: "https://habit-pet.vercel.app/api/food/save")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

    let body = [
        "foodName": food.foodName,
        "calories": food.calories,
        "weight": food.weight,
        "macros": [
            "protein": food.macros.protein,
            "carbs": food.macros.carbs,
            "fat": food.macros.fat
        ]
    ]

    request.httpBody = try JSONSerialization.data(withJSONObject: body)

    let (_, response) = try await URLSession.shared.data(for: request)
    guard (response as? HTTPURLResponse)?.statusCode == 200 else {
        throw URLError(.badServerResponse)
    }
}
```

## 🤝 Sharing with Your Friend

Your friend can use the package in her Swift app:

### Method 1: Local Package (Development)

```swift
// In her Package.swift or Xcode:
.package(path: "../calorie-camera")
```

### Method 2: Git Repository (Production)

1. Create a separate repo for `calorie-camera`
2. Push to GitHub/GitLab
3. She adds via URL:

```swift
.package(url: "https://github.com/your-org/calorie-camera", from: "1.0.0")
```

## 🔄 Sync with Web App

Both Swift and Web apps can share:
- Same API endpoints
- Same nutrition database
- Same food detection logic (via API)

```
┌─────────────┐
│  iOS App    │────┐
│  (Swift)    │    │
└─────────────┘    │
                   ├──→ Vercel API ←──┐
┌─────────────┐    │                  │
│  Web App    │────┘                  │
│  (React)    │                       │
└─────────────┘                       │
                              ┌───────┴────────┐
                              │   Supabase DB  │
                              └────────────────┘
```

## 📊 Testing

### Run Swift Tests

```bash
cd calorie-camera
swift test
```

Or in Xcode: **Product → Test** (⌘U)

### Test Coverage

- ✅ Food detection with sample images
- ✅ Nutrition database queries
- ✅ Data fusion logic
- ✅ User corrections

## 🐛 Troubleshooting

### Issue: Camera not appearing
**Solution**:
- Must run on real device (simulator has no camera)
- Check permissions in Settings → Your App → Camera

### Issue: Package not found in Xcode
**Solution**:
- Clean build: Product → Clean Build Folder (⌘⇧K)
- Reset package cache: File → Packages → Reset Package Caches
- Restart Xcode

### Issue: Food detection not accurate
**Solution**:
- Current implementation uses Vision framework (placeholder)
- For production, train custom CoreML model
- Or integrate cloud ML API (Google Vision, Clarifai)

## 🎨 Customization

### Change UI Theme

Edit `UXKit/CameraPreviewView.swift`:

```swift
// Change colors, fonts, layout
.foregroundColor(.blue)  // Change to your brand color
```

### Add Custom Foods

Edit `NutritionKit/NutritionDatabase.swift`:

```swift
private func loadDefaultDatabase() {
    let customFood = NutritionInfo(
        name: "Your Custom Food",
        servingSize: 100,
        calories: 250,
        macros: Macronutrients(...),
        emoji: "🍱"
    )
    foodItems["your custom food"] = customFood
}
```

### Configure ML Model

Replace placeholder in `PerceptionKit/FoodDetector.swift` with your trained model.

## 📚 Resources

- [CalorieCameraKit README](calorie-camera/README.md)
- [Demo App README](calorie-camera-demo/README.md)
- [Apple Vision Framework](https://developer.apple.com/documentation/vision)
- [Swift Package Manager](https://swift.org/package-manager/)

## 🔐 Environment Variables

For API keys and secrets, create a `.env` file:

```bash
# iOS app will read from Info.plist or Configuration
API_BASE_URL=https://habit-pet.vercel.app
API_KEY=your_api_key_here
```

## 📦 Publishing the Package

When ready to share:

1. Create GitHub repo for `calorie-camera`
2. Add version tag: `git tag 1.0.0`
3. Push: `git push --tags`
4. Share URL with your friend

## 🎯 Next Steps

1. ✅ **Test Demo App** - Run on real iOS device
2. ⬜ **Train ML Model** - Custom food detection
3. ⬜ **Connect APIs** - Integrate with Vercel backend
4. ⬜ **Add Features** - Barcode scanning, meal history
5. ⬜ **Deploy** - TestFlight for beta testing

## 💡 Tips

- **Development**: Use demo app for quick iteration
- **Production**: Integrate package into main app
- **Collaboration**: Share package repo with your friend
- **Testing**: Use MockServices for UI testing without camera

## 🤔 Questions?

Check the individual README files in each directory for detailed documentation.

---

**Happy coding! 🚀**
