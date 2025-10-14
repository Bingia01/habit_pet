## CalorieCameraKit – Friend Setup Guide

> Goal: get the Calorie Camera demo running on your device in under 10 minutes.

### 1. Prerequisites
- Xcode 15.4 or later
- iOS device running 16.0+ (camera features require hardware)
- Access to the shared HabitPet repository zip or branch

### 2. Project Layout
```
calorie-camera/          # Swift Package (CalorieCameraKit)
calorie-camera-demo/     # Demo iOS app
handoff/sample.env       # Example server-side env vars
```

### 3. Configure the Demo App
1. Copy `calorie-camera-demo/Config/calorie-camera.json.example` to `calorie-camera-demo/Config/calorie-camera.json` if it is not already present.
2. Edit `calorie-camera-demo/Config/calorie-camera.json`:
   - Set `"web_base"` to the production URL we provided (e.g. `https://habit-pet.vercel.app`).
   - Leave `"analyzer_choice"` on `"stub"` if you want offline mode; change to `"supabase"` or `"openai"` once the server is ready.

### 4. Open the Demo in Xcode
1. Launch Xcode.
2. Choose **File ▸ Open…** and select `calorie-camera-demo/CalorieCameraDemoApp.xcodeproj` (or create a new SwiftUI iOS App in that folder if the .xcodeproj is not yet generated).
3. In the Navigator, select the app target → **Package Dependencies** → **+** → **Add Local** → choose the `calorie-camera/` folder.

### 5. Update Info.plist
Add the camera permission string:
```
Privacy - Camera Usage Description : We need camera access to capture food photos.
```

### 6. Run on Device
1. Connect your iPhone and select it as the run destination.
2. Build & Run (⌘R).
3. Approve camera permissions when prompted.
4. Expect:
   - With network on and ANALYZER_CHOICE ≠ `"stub"` you’ll see evidence badges that include “Analyzer”.
   - With airplane mode or `"stub"` you’ll still get geometry-only calories (badge shows “Geometry”).

### 7. Switching Environments
- To point at staging vs production, update only the `"web_base"` value in `calorie-camera.json`.
- No code changes are required; the SDK reads this at launch.

### 8. Troubleshooting
- **Build errors about the package**: Remove and re-add `calorie-camera/` as a local package.
- **Analyzer timeouts**: confirm the server env matches `handoff/sample.env` and that `ANALYZER_CHOICE` is set correctly.
- **Camera denied**: enable camera access in *Settings ▸ Privacy ▸ Camera*.

### 9. Verification Checklist
☐ App installs on device  
☐ Camera opens and reaches “Capture quality” progress 100%  
☐ Analyzer badge appears when network is on  
☐ Switching `"analyzer_choice"` to `"stub"` falls back to geometry-only output

That’s it—share any issues in chat and we’ll iterate together.
