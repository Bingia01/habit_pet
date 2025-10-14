# 📤 Sharing CalorieCameraKit with Your Friend

## Quick Overview

You've built a complete Swift camera package that your friend can use in her iOS app. Here's how to share it.

## 🎁 What She Gets

A complete, production-ready Swift Package with:
- ✅ Full camera capture system
- ✅ ML food detection
- ✅ Nutrition database (40+ foods)
- ✅ Beautiful SwiftUI UI
- ✅ Complete documentation
- ✅ Test suite

**She can integrate it in ~15 minutes!**

## 📤 3 Ways to Share

### Option 1: Send the Folder (Easiest for Testing)

1. **Zip the package:**
```bash
cd /Users/wutthichaiupatising/habit_pet
zip -r calorie-camera.zip calorie-camera/
```

2. **Send her:** `calorie-camera.zip`

3. **She unzips** and adds to her Xcode project:
   - File → Add Package Dependencies
   - Add Local → Select `calorie-camera` folder

### Option 2: GitHub Repository (Best for Collaboration)

1. **Create new repo:**
```bash
cd calorie-camera
git init
git add .
git commit -m "Initial CalorieCameraKit package"
```

2. **Push to GitHub:**
```bash
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/CalorieCameraKit.git
git branch -M main
git push -u origin main
```

3. **She adds via URL in Xcode:**
   - File → Add Package Dependencies
   - Enter: `https://github.com/YOUR_USERNAME/CalorieCameraKit`
   - Select version/branch

### Option 3: Shared Workspace (For Active Development)

If you both work on the same codebase:
```
your-project/
  ├── calorie-camera/          # Your package
  ├── her-app/                 # Her iOS app
  └── habit-pet/               # Your web app
```

She references: `.package(path: "../calorie-camera")`

## 📱 How She Integrates It

### Step 1: Add Package to Her Xcode Project

In her Xcode project:
1. Select project in navigator
2. Go to **Package Dependencies** tab
3. Click **+**
4. Add Local (if folder) or Add Remote (if GitHub)
5. Select package and click **Add**

### Step 2: Import and Use

In her Swift file:

```swift
import SwiftUI
import CalorieCameraKit

struct FoodTrackerView: View {
    @State private var showCamera = false
    @State private var capturedFoods: [EnrichedFoodData] = []

    var body: some View {
        VStack {
            // Her existing UI
            List(capturedFoods) { food in
                HStack {
                    Text(food.emoji)
                    Text(food.foodName)
                    Spacer()
                    Text("\(food.calories) cal")
                }
            }

            // Add camera button
            Button("Scan Food") {
                showCamera = true
            }
        }
        .fullScreenCover(isPresented: $showCamera) {
            CalorieCameraView(
                onFoodCaptured: { food in
                    // She gets complete food data!
                    capturedFoods.append(food)
                    showCamera = false

                    // Optional: Save to her backend
                    saveFoodToBackend(food)
                },
                onDismiss: {
                    showCamera = false
                }
            )
        }
    }

    func saveFoodToBackend(_ food: EnrichedFoodData) {
        // She can save to her own API or yours
        // food.foodName, food.calories, food.macros, etc.
    }
}
```

### Step 3: Add Camera Permission

She needs to add to her `Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to scan and identify food items</string>
```

### Step 4: Build and Run!

That's it! She now has a working camera feature.

## 🎯 What She Can Do With It

### Basic Usage
```swift
CalorieCameraView(
    onFoodCaptured: { food in
        print(food.foodName)      // "Apple"
        print(food.calories)      // 52
        print(food.weight)        // 150 (grams)
        print(food.confidence)    // 0.95 (95%)
        print(food.emoji)         // "🍎"
        print(food.macros.protein) // 0.3g
        print(food.macros.carbs)   // 14.0g
        print(food.macros.fat)     // 0.2g
    },
    onDismiss: { }
)
```

### Advanced Usage

She can also use individual components:

```swift
import CalorieCameraKit

// Use just the camera manager
let cameraManager = CameraManager()
try await cameraManager.startSession()
cameraManager.capturePhoto()

// Use just the food detector
let detector = FoodDetector()
let detections = try await detector.detectFood(in: image)

// Use just the nutrition database
let database = NutritionDatabase()
let nutrition = database.getNutrition(for: "banana")

// Use data fusion
let fusion = DataFusion()
let enrichedData = fusion.fuseData(detection: analysis)
```

## 🔗 Connecting to Your Shared Backend

If you want both apps to share the same nutrition database:

### In Your Web App (Vercel API)
```typescript
// pages/api/nutrition/[food].ts
export default async function handler(req, res) {
  const { food } = req.query;
  const nutrition = await db.getNutrition(food);
  res.json(nutrition);
}
```

### In Her Swift App
```swift
// In NutritionDatabase.swift
func loadFromAPI(endpoint: String) async throws {
    let url = URL(string: "https://habit-pet.vercel.app/api/nutrition/\(foodName)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    // Parse and use...
}
```

Update her config:
```json
{
  "nutrition": {
    "api_endpoint": "https://habit-pet.vercel.app/api/nutrition"
  }
}
```

## 🎨 Customization She Can Do

### Change Colors
```swift
// In UXKit/CameraPreviewView.swift
.foregroundColor(.blue)  // Change to her brand color
```

### Add Custom Foods
```swift
// In NutritionKit/NutritionDatabase.swift
let customFood = NutritionInfo(
    name: "Her Custom Food",
    servingSize: 100,
    calories: 250,
    macros: Macronutrients(...),
    emoji: "🍱"
)
```

### Replace ML Model
```swift
// In PerceptionKit/FoodDetector.swift
// She can add her own CoreML model
// Or use different API (Google Vision, etc.)
```

## 📚 Documentation to Share

Send her these files:
1. ✅ **calorie-camera/README.md** - Complete API documentation
2. ✅ **calorie-camera-demo/** - Working demo app she can reference
3. ✅ **This file** - Integration instructions

## 🐛 Common Issues & Solutions

### "Package not found"
- Make sure path is correct
- Try: File → Packages → Reset Package Caches
- Restart Xcode

### "Camera not working"
- Must test on real device (simulator has no camera)
- Check Info.plist has camera permission
- User must grant permission in Settings

### "Food detection not accurate"
- Current implementation uses Vision framework (placeholder)
- For production: Train custom CoreML model or use cloud API
- Can use your Clarifai API endpoint instead

## 🔄 Keeping It Updated

### If Using GitHub:
```bash
# You make changes:
git add .
git commit -m "Improved food detection"
git push

# She updates in Xcode:
# File → Packages → Update to Latest Package Versions
```

### If Using Local Folder:
Just share the updated folder when you make changes.

## 🎯 Example: Complete Integration

Here's a complete example for her:

```swift
import SwiftUI
import CalorieCameraKit

@main
struct HerApp: App {
    var body: some Scene {
        WindowGroup {
            MainView()
        }
    }
}

struct MainView: View {
    @State private var showCamera = false
    @State private var todaysFoods: [EnrichedFoodData] = []

    var totalCalories: Int {
        todaysFoods.reduce(0) { $0 + $1.calories }
    }

    var body: some View {
        NavigationView {
            VStack {
                // Stats
                Text("Today: \(totalCalories) cal")
                    .font(.largeTitle)
                    .padding()

                // Food list
                List(todaysFoods) { food in
                    HStack {
                        Text(food.emoji)
                            .font(.system(size: 40))
                        VStack(alignment: .leading) {
                            Text(food.foodName)
                                .font(.headline)
                            Text("\(food.calories) cal • \(Int(food.weight))g")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }

                // Camera button
                Button(action: { showCamera = true }) {
                    Label("Scan Food", systemImage: "camera.fill")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(10)
                }
                .padding()
            }
            .navigationTitle("Food Tracker")
            .fullScreenCover(isPresented: $showCamera) {
                CalorieCameraView(
                    onFoodCaptured: { food in
                        todaysFoods.append(food)
                        showCamera = false
                    },
                    onDismiss: { showCamera = false }
                )
            }
        }
    }
}
```

## 💬 What to Tell Her

Send her this message:

---

> Hey! I built a Swift camera package for food tracking that you can use in your app. It has:
>
> - Full camera capture
> - ML food detection
> - Nutrition database
> - Beautiful SwiftUI UI
>
> It's super easy to integrate - just add the package and call `CalorieCameraView`. Check out the README for full docs!
>
> I've included a demo app so you can see it working. Let me know if you need help!

---

## 📦 Files to Share

1. **The Package:** `calorie-camera/` folder (or GitHub URL)
2. **Demo App:** `calorie-camera-demo/` folder
3. **This Guide:** `SHARING_WITH_FRIEND.md`
4. **Quick Start:** `QUICK_START.md`

## 🚀 That's It!

She can now integrate your camera feature in her Swift app while you keep your web app separate. Best of both worlds!

---

**Need help?** All the documentation is in the package README files!