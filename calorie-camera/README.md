# CalorieCameraKit

A Swift Package for iOS that provides camera-based food detection and calorie tracking capabilities.

## Features

- 📸 **CaptureKit**: Camera management and photo capture
- 🧠 **PerceptionKit**: ML-based food detection and analysis
- 🥗 **NutritionKit**: Nutrition database and food information
- 🔄 **FusionKit**: Data fusion from multiple sources (ML, database, user input)
- 🎨 **UXKit**: Pre-built UI components for camera and analysis views

## Requirements

- iOS 16.0+ / macOS 13.0+
- Xcode 14.0+
- Swift 5.9+

## Installation

### Swift Package Manager

Add this package to your Xcode project:

1. In Xcode, select **File** → **Add Package Dependencies**
2. Enter the package URL (or use local path for development)
3. Select the version you want to use

Or add it to your `Package.swift`:

```swift
dependencies: [
    .package(path: "../calorie-camera")
]
```

## Quick Start

### Basic Usage

```swift
import SwiftUI
import CalorieCameraKit

struct ContentView: View {
    @State private var showCamera = false

    var body: some View {
        Button("Open Camera") {
            showCamera = true
        }
        .fullScreenCover(isPresented: $showCamera) {
            CalorieCameraView(
                onFoodCaptured: { foodData in
                    print("Captured: \(foodData.foodName)")
                    print("Calories: \(foodData.calories)")
                    showCamera = false
                },
                onDismiss: {
                    showCamera = false
                }
            )
        }
    }
}
```

### Advanced Usage

#### Camera Manager

```swift
import CalorieCameraKit

@MainActor
class CameraViewModel: ObservableObject {
    private let cameraManager = CameraManager()

    func startCapture() async throws {
        try await cameraManager.startSession()
    }

    func capturePhoto() {
        cameraManager.capturePhoto()
    }
}
```

#### Food Detection

```swift
import CalorieCameraKit

let detector = FoodDetector()
let detections = try await detector.detectFood(in: image)

if let firstDetection = detections.first {
    let analysis = try await detector.analyzeFood(
        detection: firstDetection,
        image: image
    )
    print("Detected: \(analysis.foodName)")
}
```

#### Nutrition Database

```swift
import CalorieCameraKit

let database = NutritionDatabase()

// Search for food
let results = database.searchFood(query: "apple")

// Get specific nutrition info
if let nutrition = database.getNutrition(for: "banana") {
    print("Calories: \(nutrition.calories)")
    print("Protein: \(nutrition.macros.protein)g")
}

// Load from API
try await database.loadFromAPI(endpoint: "https://your-api.com/nutrition")
```

#### Data Fusion

```swift
import CalorieCameraKit

let fusion = DataFusion()

// Enrich detection with database info
let enrichedData = fusion.fuseData(detection: analysis)

// Combine multiple detections into a meal
let meal = fusion.createMeal(from: [detection1, detection2])

// Apply user corrections
let corrected = fusion.applyUserCorrection(
    detection: enrichedData,
    correctedName: "Green Apple",
    correctedWeight: 120
)
```

## Architecture

```
CalorieCameraKit/
├── CaptureKit/          # Camera and photo capture
│   └── CameraManager.swift
├── PerceptionKit/       # ML food detection
│   └── FoodDetector.swift
├── NutritionKit/        # Nutrition data
│   └── NutritionDatabase.swift
├── FusionKit/           # Data fusion
│   └── DataFusion.swift
├── UXKit/               # UI components
│   └── CameraPreviewView.swift
└── CalorieCameraView.swift  # Main view
```

## Integration with Backend

Connect to your Vercel API:

```swift
let database = NutritionDatabase()

// Load nutrition priors
try await database.loadFromAPI(
    endpoint: "https://your-app.vercel.app/api/priors/apple"
)
```

## Camera Permissions

Add these keys to your `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture food photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to save captured images</string>
```

## Testing

Run tests with:

```bash
swift test
```

Or in Xcode: **Product** → **Test** (⌘U)

## Configuration

Place a `calorie-camera.json` config file in your app bundle:

```json
{
  "camera": {
    "preferred_camera": "back",
    "photo_quality": "high"
  },
  "ml_models": {
    "food_detection": {
      "confidence_threshold": 0.7
    }
  },
  "api": {
    "endpoints": {
      "priors": "/api/priors/{foodKey}"
    }
  }
}
```

## Models

### EnrichedFoodData

```swift
struct EnrichedFoodData {
    let foodName: String
    let confidence: Double
    let weight: Double        // grams
    let calories: Int
    let macros: Macronutrients
    let emoji: String
    let source: DataSource
}
```

### Macronutrients

```swift
struct Macronutrients {
    let protein: Double  // grams
    let carbs: Double    // grams
    let fat: Double      // grams
    let fiber: Double    // grams
}
```

## Demo App

Check out the demo app in `calorie-camera-demo/` for a complete example.

## Roadmap

- [ ] Support for custom ML models
- [ ] Barcode scanning integration
- [ ] Multi-food detection in single image
- [ ] Portion size reference guide
- [ ] Voice input for food names
- [ ] Cloud sync for nutrition database
- [ ] Meal history and analytics

## Contributing

This is part of the HabitPet project. For contributions, please coordinate with the team.

## License

Proprietary - HabitPet © 2025
