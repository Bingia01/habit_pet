# V2 Integration Guide

## Quick Start

To use the new v2 geometry estimator, follow these steps:

### 1. Basic Usage (Single Frame)

Replace the existing `GeometryEstimator` with `GeometryEstimatorV2`:

```swift
import CalorieCameraKit

// Old way:
// let estimator = GeometryEstimator(parameters: ...)

// New way:
let estimator = GeometryEstimatorV2(config: .default)
let estimate = estimator.estimate(from: frame, priors: priors)
```

### 2. Multi-Frame Usage (Temporal Fusion)

For best stability, capture multiple frames and let temporal fusion smooth the estimates:

```swift
let estimator = GeometryEstimatorV2(config: .default)

// Reset at start of capture session
estimator.resetTemporalState()

// Capture multiple frames
var frames: [CapturedFrame] = []
for _ in 0..<5 {
    if let frame = try? captureService.captureFrame() {
        frames.append(frame)
    }
}

// Process frames sequentially (temporal fusion will activate after 2 frames)
var estimates: [GeometryEstimate] = []
for frame in frames {
    if let estimate = estimator.estimate(from: frame, priors: priors) {
        estimates.append(estimate)
    }
}

// The last estimate will use EMA-smoothed values from all frames
let finalEstimate = estimates.last
```

### 3. Using Custom Configuration

Load configuration from JSON file:

```swift
// Add geometry-config.json to your app bundle
guard let configURL = Bundle.main.url(forResource: "geometry-config", withExtension: "json") else {
    fatalError("geometry-config.json not found")
}

do {
    let config = try GeometryConfig.load(from: configURL)
    let estimator = GeometryEstimatorV2(config: config)
    // Use estimator...
} catch {
    print("Failed to load config: \(error)")
    // Fall back to default
    let estimator = GeometryEstimatorV2(config: .default)
}
```

### 4. Integration with CalorieCameraView

Update `CalorieCameraView.swift` to use v2:

```swift
// In CalorieCameraView, replace GeometryEstimator initialization:

// OLD:
// private let geometryEstimator = GeometryEstimator(parameters: ...)

// NEW:
private let geometryEstimator = GeometryEstimatorV2(config: .default)

// In capture handler, reset temporal state:
func handleCapture() {
    geometryEstimator.resetTemporalState()
    
    // Capture multiple frames for temporal fusion
    Task {
        var frames: [CapturedFrame] = []
        for _ in 0..<3 { // Capture 3 frames
            if let frame = try? await captureService.captureFrame() {
                frames.append(frame)
            }
        }
        
        // Process each frame (temporal fusion will smooth across frames)
        for frame in frames {
            if let estimate = geometryEstimator.estimate(
                from: frame,
                priors: analyzerObservation?.priors
            ) {
                // Use estimate...
            }
        }
    }
}
```

### 5. Using Segmentation Masks (When Available)

If your analyzer provides segmentation masks, pass them to the estimator:

```swift
// Assuming analyzer provides segmentation mask
if let segmentationMask = analyzerObservation?.segmentationMask {
    let estimate = estimator.estimate(
        from: frame,
        priors: priors,
        segmentationMask: segmentationMask
    )
} else {
    // Falls back to depth-based detection
    let estimate = estimator.estimate(from: frame, priors: priors)
}
```

## Configuration Tuning

### For More Stability

Increase the number of frames required for temporal fusion:

```json
{
  "temporalFusion": {
    "minFrames": 3,
    "maxFrames": 7
  }
}
```

### For Faster Response

Decrease the minimum frames:

```json
{
  "temporalFusion": {
    "minFrames": 1,
    "maxFrames": 3
  }
}
```

### For Stricter Validation

Lower the extreme z-score threshold:

```json
{
  "softValidation": {
    "extremeZScoreThreshold": 3.0
  }
}
```

### For More Lenient Validation

Raise the extreme z-score threshold:

```json
{
  "softValidation": {
    "extremeZScoreThreshold": 7.0
  }
}
```

## Testing

### Test Stability

Capture the same food item 10 times and verify variance:

```swift
var estimates: [Double] = []
for _ in 0..<10 {
    estimator.resetTemporalState()
    if let estimate = estimator.estimate(from: frame, priors: priors) {
        estimates.append(estimate.calories)
    }
}

let mean = estimates.reduce(0, +) / Double(estimates.count)
let variance = estimates.map { pow($0 - mean, 2) }.reduce(0, +) / Double(estimates.count)
let stdDev = sqrt(variance)
let coefficientOfVariation = stdDev / mean

print("Mean: \(mean) kcal")
print("Std Dev: \(stdDev) kcal")
print("CV: \(coefficientOfVariation * 100)%")
// CV should be < 20% for stable estimates
```

### Test Temporal Fusion

Compare single frame vs multi-frame:

```swift
// Single frame
estimator.resetTemporalState()
let singleEstimate = estimator.estimate(from: frame1, priors: priors)

// Multi-frame (3 frames)
estimator.resetTemporalState()
let _ = estimator.estimate(from: frame1, priors: priors)
let _ = estimator.estimate(from: frame2, priors: priors)
let multiEstimate = estimator.estimate(from: frame3, priors: priors)

// Multi-frame should have lower uncertainty (sigma)
print("Single frame sigma: \(singleEstimate?.sigma ?? 0)")
print("Multi-frame sigma: \(multiEstimate?.sigma ?? 0)")
```

## Troubleshooting

### Estimates Still Unstable

1. Increase `temporalFusion.minFrames` to 3-5
2. Increase `temporalFusion.areaFractionAlpha` (more smoothing)
3. Check depth data quality (confidence map)

### Too Many Rejections

1. Increase `softValidation.extremeZScoreThreshold` to 7.0
2. Adjust calibration distributions in `softValidation`
3. Check if depth data is valid (not all zeros)

### Estimates Too High/Low

1. Check priors (density, kcalPerG) from analyzer
2. Verify depth conversion (use `DepthModel` if needed)
3. Check pixel area calculation (camera intrinsics)

## Performance Notes

- **Single frame**: ~10-20ms processing time
- **Multi-frame (5 frames)**: ~50-100ms total
- **Memory**: Minimal (only stores EMA state, ~100 bytes)

## Migration Checklist

- [ ] Replace `GeometryEstimator` with `GeometryEstimatorV2`
- [ ] Add `resetTemporalState()` call at capture start
- [ ] Update to multi-frame capture (optional but recommended)
- [ ] Add `geometry-config.json` to app bundle (optional)
- [ ] Test stability with same food item multiple times
- [ ] Verify no regressions in existing functionality

