# Calorie Camera Demo App

A demo iOS app showcasing the **CalorieCameraKit** Swift Package.

## Setup Instructions

### 1. Open in Xcode

Since we can't generate `.xcodeproj` files programmatically, you'll need to create the Xcode project manually:

1. Open Xcode
2. Create a new project: **File → New → Project**
3. Choose **iOS → App**
4. Fill in details:
   - Product Name: `CalorieCameraDemoApp`
   - Team: Your development team
   - Organization Identifier: `com.habitpet` (or your own)
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Save location: Choose `calorie-camera-demo/` directory

### 2. Add Swift Package

1. In Xcode, select your project
2. Go to **Package Dependencies** tab
3. Click **+** to add a package
4. Click **Add Local...** and select the `calorie-camera` folder
5. Click **Add Package**

### 3. Copy Source Files

The Swift source files are already in place:
- `App/App.swift` - Main app entry point
- `App/ContentView.swift` - Main UI
- `App/MockServices.swift` - Mock data for testing

Just make sure these files are added to your Xcode project target.

### 4. Add Configuration

1. Add `Config/calorie-camera.json` to your Xcode project
2. Ensure it's included in the app target

### 5. Configure Permissions

Add camera permission to `Info.plist`:

Right-click `Info.plist` → **Open As → Source Code**, then add:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture and analyze food photos for calorie tracking</string>
```

Or add via Xcode UI:
- Select `Info.plist`
- Add new key: **Privacy - Camera Usage Description**
- Value: "We need camera access to capture and analyze food photos for calorie tracking"

### 6. Run the App

1. Select a simulator or real device (camera features require a real device)
2. Press **⌘R** to build and run

## Project Structure

```
calorie-camera-demo/
├── CalorieCameraDemoApp.xcodeproj  # (Create this in Xcode)
├── App/
│   ├── App.swift                    # App entry point
│   ├── ContentView.swift            # Main UI with food list
│   └── MockServices.swift           # Mock data generators
└── Config/
    └── calorie-camera.json          # App configuration
```

## Features Demonstrated

### 1. Camera Capture
- Full-screen camera view
- Photo capture with overlay guides
- Camera permission handling

### 2. Food Detection
- ML-based food recognition
- Confidence scoring
- Multiple food support

### 3. Nutrition Display
- Calorie information
- Macronutrient breakdown (Protein, Carbs, Fat)
- Weight estimation

### 4. Food Tracking
- List of captured foods
- Daily totals (calories, macros)
- Individual food details

### 5. Data Fusion
- Combines ML detection with nutrition database
- User corrections support
- Multiple data sources

## Testing Without Camera

If testing on simulator or without camera access, you can use the mock services:

```swift
// In ContentView.swift, add a test button:
Button("Add Mock Food") {
    let mockFood = MockServices.createMockFood()
    capturedFoods.append(mockFood)
}
```

## Customization

### Change Theme Colors

Edit the gradient in `ContentView.swift`:

```swift
LinearGradient(
    colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
    startPoint: .topLeading,
    endPoint: .bottomTrailing
)
```

### Modify ML Confidence Threshold

Edit `Config/calorie-camera.json`:

```json
{
  "ml_models": {
    "food_detection": {
      "confidence_threshold": 0.8  // Change this value
    }
  }
}
```

### Add Custom Foods

Edit `NutritionDatabase.swift` in the package to add more foods to the default database.

## Troubleshooting

### Camera Not Working
- Ensure you're running on a real device (simulator doesn't have camera)
- Check that camera permissions are granted in Settings
- Verify `Info.plist` has camera usage description

### Build Errors
- Make sure CalorieCameraKit package is properly added
- Clean build folder: **Product → Clean Build Folder** (⌘⇧K)
- Restart Xcode if package doesn't appear

### Food Detection Not Working
- The current implementation uses Vision framework as placeholder
- For production, you'll need a custom CoreML model trained on food images
- Consider using cloud APIs (Google Vision, Clarifai, etc.) as alternative

## Next Steps

1. **Add Real ML Model**: Train or download a food detection CoreML model
2. **Connect to Backend**: Integrate with your Vercel API endpoints
3. **Add Persistence**: Save food history to CoreData or CloudKit
4. **Enhance UI**: Add animations, haptics, and better visuals
5. **Test on Device**: Test camera and detection on real iOS device

## API Integration

To connect with your Vercel backend:

```swift
// In ContentView or a ViewModel:
func syncWithBackend(food: EnrichedFoodData) async {
    let url = URL(string: "https://habit-pet.vercel.app/api/priors/\(food.foodName)")!
    // Make API call...
}
```

## Resources

- [CalorieCameraKit Documentation](../calorie-camera/README.md)
- [Apple Vision Framework](https://developer.apple.com/documentation/vision)
- [CoreML Documentation](https://developer.apple.com/documentation/coreml)
- [AVFoundation Camera Guide](https://developer.apple.com/documentation/avfoundation/cameras_and_media_capture)

## Support

For issues or questions about the demo app, check the main project documentation or contact the development team.
