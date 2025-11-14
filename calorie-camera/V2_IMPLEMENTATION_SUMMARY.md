# Geometry Estimator V2 Implementation Summary

## Overview

This document summarizes the v2 implementation of the geometry estimation system, addressing the critical stability and accuracy issues identified in the original design.

## What Was Implemented

### 1. Config System (`GeometryConfig.swift`)

**Purpose**: Replace all hard-coded magic numbers with configurable parameters.

**Key Components**:
- `RobustStatsConfig`: Percentile ranges, IQR multipliers
- `TemporalFusionConfig`: EMA alpha values, frame buffer limits
- `SoftValidationConfig`: Z-score thresholds, plausibility calibration
- `VolumeUncertaintyConfig`: Adaptive uncertainty based on volume size
- `ValidationBounds`: Soft bounds for physical validation

**Usage**:
```swift
let config = GeometryConfig.default // or load from JSON
let estimator = GeometryEstimatorV2(config: config)
```

### 2. Robust Statistics (`RobustStatistics.swift`)

**Purpose**: Replace min/max with median/IQR for outlier-resistant calculations.

**Key Functions**:
- `median()`: Calculate median from sorted array
- `iqr()`: Calculate interquartile range
- `percentile()`: Get value at specific percentile
- `heightBand()`: Calculate height bounds using IQR multipliers
- `countInPercentileRange()`: Count pixels in percentile range

**Impact**: Fixes height calculation instability (Problem #1.2)

### 3. Temporal Fusion (`TemporalFusionState` in `GeometryConfig.swift`)

**Purpose**: Smooth estimates across multiple frames using EMA.

**Key Features**:
- EMA smoothing for area fraction, median depth, and height
- Configurable alpha values per metric
- Frame buffer management (max 5 frames)
- Minimum frame requirement (2 frames) before using fusion

**Impact**: Fixes 150→300→500 kcal instability (Problem #1.1, #1.3, #1.4)

**Usage**:
```swift
estimator.resetTemporalState() // Call at start of capture
// Call estimate() multiple times with different frames
// After 2+ frames, estimates will be temporally smoothed
```

### 4. Soft Validation (`PlausibilityCalculator` in `GeometryConfig.swift`)

**Purpose**: Replace hard rejections with plausibility scores that adjust uncertainty.

**Key Features**:
- Z-score based plausibility calculation
- Height and volume calibration distributions
- Combined plausibility from multiple factors
- Uncertainty adjustment (multiply by 1.5x if plausibility < 0.3)
- Extreme outlier detection (z-score > 5.0) for hard rejection

**Impact**: Fixes over-aggressive validation (Problem #6.1, #6.2, #6.3)

**How It Works**:
1. Calculate z-scores for height and volume against calibration distributions
2. Convert z-scores to plausibility (0-1) using exponential decay
3. If plausibility < threshold, increase uncertainty (don't reject)
4. Only reject if z-score > 5.0 (extreme outlier)

### 5. GeometryEstimatorV2 (`GeometryEstimatorV2.swift`)

**Purpose**: Main estimator implementing all v2 improvements.

**Key Improvements**:
- Uses robust statistics (median/IQR) instead of min/max
- Supports temporal fusion across frames
- Applies soft validation with plausibility scores
- Segmentation-first food pixel detection (with depth fallback)
- Config-driven parameters (no hard-coded values)

**API**:
```swift
let estimator = GeometryEstimatorV2(config: .default)
estimator.resetTemporalState()

// Single frame (no temporal fusion)
let estimate1 = estimator.estimate(from: frame1, priors: priors)

// Multiple frames (temporal fusion active after 2 frames)
let estimate2 = estimator.estimate(from: frame2, priors: priors)
let estimate3 = estimator.estimate(from: frame3, priors: priors)
// estimate3 will use EMA-smoothed values from frames 1-3
```

### 6. DepthModel Abstraction (`DepthModel.swift`)

**Purpose**: Configurable depth conversion instead of hard-coded `depth = 1/disparity`.

**Key Features**:
- Device/sensor-specific calibration
- Support for LiDAR, dual camera, monocular
- Configurable depth-to-disparity factors
- Confidence map filtering
- Depth range validation

**Usage**:
```swift
// LiDAR (normalized disparity)
let lidarModel = DepthModelFactory.lidarModel()

// Dual camera (with calibration factor)
let stereoModel = DepthModelFactory.dualCameraModel(
    depthToDisparityFactor: calibrationData.depthToDisparityFactor
)

// Convert disparity map
let depthMap = lidarModel.convertDisparityMap(disparityArray)
```

## Integration Points

### Current Integration

The v2 components are **standalone** and can be integrated incrementally:

1. **Immediate**: Use `GeometryEstimatorV2` alongside existing `GeometryEstimator`
2. **Gradual**: Migrate to v2 by updating `CalorieCameraView.swift` to use `GeometryEstimatorV2`
3. **Full**: Replace `GeometryEstimator` with `GeometryEstimatorV2` once validated

### Required Changes for Full Integration

1. **CalorieCameraView.swift**:
   ```swift
   // Replace:
   let estimator = GeometryEstimator(parameters: ...)
   
   // With:
   let estimator = GeometryEstimatorV2(config: .default)
   estimator.resetTemporalState()
   
   // For multi-frame capture:
   for frame in frames {
       let estimate = estimator.estimate(from: frame, priors: priors)
   }
   ```

2. **SystemPhotoCaptureService.swift**:
   - Optionally use `DepthModel` for depth conversion
   - Currently uses hard-coded conversion (can be replaced)

3. **Config Loading**:
   ```swift
   // Load from JSON file
   if let configURL = Bundle.main.url(forResource: "geometry-config", withExtension: "json") {
       let config = try GeometryConfig.load(from: configURL)
       let estimator = GeometryEstimatorV2(config: config)
   }
   ```

## Testing Strategy

### Unit Tests Needed

1. **RobustStatistics**:
   - Test median/IQR calculation
   - Test percentile calculation
   - Test height band calculation

2. **TemporalFusionState**:
   - Test EMA smoothing
   - Test frame accumulation
   - Test reset functionality

3. **PlausibilityCalculator**:
   - Test z-score calculation
   - Test plausibility conversion
   - Test uncertainty adjustment

4. **GeometryEstimatorV2**:
   - Test single frame estimation
   - Test multi-frame temporal fusion
   - Test soft validation (plausibility adjustment)
   - Test extreme outlier rejection

### Integration Tests

1. **Stability Test**: Capture same food 10 times, verify variance < 20%
2. **Temporal Fusion Test**: Capture 5 frames, verify smoothing reduces variance
3. **Soft Validation Test**: Test with edge cases (very large/small foods), verify no hard rejections

## Performance Considerations

- **Temporal Fusion**: Adds minimal overhead (EMA is O(1) per frame)
- **Robust Statistics**: Slightly slower than min/max (requires sorting), but acceptable
- **Plausibility Calculation**: Negligible overhead (simple math)

**Expected Impact**: < 50ms additional processing time per frame

## Configuration Tuning

All parameters can be tuned via JSON config:

1. **For more stability**: Increase `temporalFusion.minFrames` (e.g., 3-5)
2. **For faster response**: Decrease `temporalFusion.minFrames` (e.g., 1-2)
3. **For stricter validation**: Decrease `softValidation.extremeZScoreThreshold` (e.g., 3.0)
4. **For more lenient validation**: Increase `softValidation.extremeZScoreThreshold` (e.g., 7.0)

## Next Steps

1. ✅ Config system created
2. ✅ Robust statistics implemented
3. ✅ Temporal fusion implemented
4. ✅ Soft validation implemented
5. ✅ DepthModel abstraction created
6. ⏳ Integration with `CalorieCameraView` (user to test)
7. ⏳ Unit tests (user to implement)
8. ⏳ Segmentation mask integration (when analyzer provides masks)

## Files Created

- `Core/GeometryConfig.swift`: Config system and plausibility calculator
- `Core/RobustStatistics.swift`: Robust statistics utilities
- `PerceptionKit/GeometryEstimatorV2.swift`: Main v2 estimator
- `PerceptionKit/DepthModel.swift`: Depth conversion abstraction
- `geometry-config.example.json`: Example configuration file

## Backward Compatibility

- ✅ Existing `GeometryEstimator` remains unchanged
- ✅ `GeometryEstimatorV2` is additive (doesn't break existing code)
- ✅ Can be used side-by-side for A/B testing
- ✅ Gradual migration path available

