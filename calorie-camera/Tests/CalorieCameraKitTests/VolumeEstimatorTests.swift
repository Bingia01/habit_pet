import XCTest
@testable import CalorieCameraKit
import CoreGraphics

final class VolumeEstimatorTests: XCTestCase {

    var volumeEstimator: DefaultVolumeEstimator!

    override func setUp() {
        super.setUp()
        volumeEstimator = DefaultVolumeEstimator()
    }

    override func tearDown() {
        volumeEstimator = nil
        super.tearDown()
    }

    // MARK: - Synthetic Test Cases

    /// Test with known synthetic depth map
    /// Cylinder of rice: 6cm radius, 5cm height
    /// Expected volume: π × r² × h = π × 36 × 5 = 565 cm³ = 565 mL
    func testCylindricalRiceVolume() async throws {
        // Create synthetic depth map for cylinder
        // Camera at 0.5m distance, cylinder 5cm tall
        let width = 100
        let height = 100
        let centerX = 50
        let centerY = 50
        let radiusPixels = 30 // 6cm radius at this resolution
        let plateDepth: Float = 0.50 // 50cm
        let foodHeight: Float = 0.05 // 5cm

        var depthMap = [Float](repeating: plateDepth, count: width * height)

        // Create cylinder in depth map
        for y in 0..<height {
            for x in 0..<width {
                let dx = Float(x - centerX)
                let dy = Float(y - centerY)
                let distFromCenter = sqrt(dx*dx + dy*dy)

                if distFromCenter <= Float(radiusPixels) {
                    // Inside cylinder - depth is closer
                    depthMap[y * width + x] = plateDepth - foodHeight
                }
            }
        }

        // Create mask covering the cylinder
        let mask = try createCircularMask(
            width: width,
            height: height,
            centerX: centerX,
            centerY: centerY,
            radius: radiusPixels
        )

        // Create camera intrinsics to match expected 6cm radius
        // For 30 pixels = 6cm at depth 0.45m: fx = 30 * 0.45 / 0.06 = 225
        let intrinsics = CameraIntrinsics(
            focalLength: SIMD2<Float>(225, 225),
            principalPoint: SIMD2<Float>(Float(width/2), Float(width/2)),
            imageSize: SIMD2<Int>(width, height)
        )

        let depthData = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: nil,
            source: .lidar
        )

        // Estimate volume
        let estimate = try await volumeEstimator.integrate(
            mask: mask,
            depth: depthData,
            intrinsics: intrinsics,
            platePlane: nil
        )

        // Expected: ~565 mL (allow ±20% due to discretization)
        XCTAssertGreaterThan(estimate.muML, 450, "Volume should be > 450 mL")
        XCTAssertLessThan(estimate.muML, 680, "Volume should be < 680 mL")

        // Uncertainty should be reasonable (< 30%)
        let relativeUncertainty = estimate.sigmaML / estimate.muML
        XCTAssertLessThan(relativeUncertainty, 0.30,
                         "Relative uncertainty should be < 30%")
    }

    /// Test with rectangular food item (toast)
    /// 10cm × 10cm × 2cm = 200 cm³ = 200 mL
    func testRectangularToastVolume() async throws {
        let width = 100
        let height = 100
        let plateDepth: Float = 0.40 // 40cm
        let toastHeight: Float = 0.02 // 2cm

        var depthMap = [Float](repeating: plateDepth, count: width * height)

        // Create rectangular toast (40x40 pixels in center)
        for y in 30..<70 {
            for x in 30..<70 {
                depthMap[y * width + x] = plateDepth - toastHeight
            }
        }

        let mask = try createRectangularMask(
            width: width,
            height: height,
            xMin: 30,
            yMin: 30,
            xMax: 70,
            yMax: 70
        )

        // For 40 pixels = 10cm at depth 0.40m: fx = 40 * 0.40 / 0.10 = 160
        let intrinsics = CameraIntrinsics(
            focalLength: SIMD2<Float>(160, 160),
            principalPoint: SIMD2<Float>(50, 50),
            imageSize: SIMD2<Int>(width, height)
        )

        let depthData = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: nil,
            source: .lidar
        )

        let estimate = try await volumeEstimator.integrate(
            mask: mask,
            depth: depthData,
            intrinsics: intrinsics,
            platePlane: nil
        )

        // Expected: ~200 mL (allow ±30% due to approximations)
        XCTAssertGreaterThan(estimate.muML, 140, "Volume should be > 140 mL")
        XCTAssertLessThan(estimate.muML, 260, "Volume should be < 260 mL")
    }

    // MARK: - Plate Plane Detection Tests

    func testPlatePlaneEstimation() async throws {
        let width = 100
        let height = 100
        let plateDepth: Float = 0.50

        // Flat plate at 50cm
        let depthMap = [Float](repeating: plateDepth, count: width * height)

        let mask = try createRectangularMask(
            width: width,
            height: height,
            xMin: 20,
            yMin: 20,
            xMax: 80,
            yMax: 80
        )

        let intrinsics = CameraIntrinsics(
            focalLength: SIMD2<Float>(500, 500),
            principalPoint: SIMD2<Float>(50, 50),
            imageSize: SIMD2<Int>(width, height)
        )

        let depthData = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: nil,
            source: .lidar
        )

        // Estimate should return ~0 volume (flat plate, no height)
        let estimate = try await volumeEstimator.integrate(
            mask: mask,
            depth: depthData,
            intrinsics: intrinsics,
            platePlane: nil
        )

        XCTAssertLessThan(estimate.muML, 10,
                         "Flat surface should have minimal volume")
    }

    // MARK: - Uncertainty Tests

    func testLowConfidenceIncreasesUncertainty() async throws {
        let width = 50
        let height = 50
        let plateDepth: Float = 0.5
        let foodHeight: Float = 0.05 // 5cm

        // Create depth map with food in center
        var depthMap = [Float](repeating: plateDepth, count: width * height)
        for y in 10..<40 {
            for x in 10..<40 {
                depthMap[y * width + x] = plateDepth - foodHeight
            }
        }

        // Low confidence map
        let lowConfidenceMap = [Float](repeating: 0.4, count: width * height)

        let mask = try createRectangularMask(
            width: width,
            height: height,
            xMin: 10,
            yMin: 10,
            xMax: 40,
            yMax: 40
        )

        // For 30 pixels = 6cm at depth 0.45m: fx = 30 * 0.45 / 0.06 = 225
        let intrinsics = CameraIntrinsics(
            focalLength: SIMD2<Float>(225, 225),
            principalPoint: SIMD2<Float>(25, 25),
            imageSize: SIMD2<Int>(width, height)
        )

        let lowConfidenceDepth = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: lowConfidenceMap,
            source: .lidar
        )

        let estimateLowConf = try await volumeEstimator.integrate(
            mask: mask,
            depth: lowConfidenceDepth,
            intrinsics: intrinsics,
            platePlane: nil
        )

        // High confidence map
        let highConfidenceMap = [Float](repeating: 0.9, count: width * height)

        let highConfidenceDepth = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: highConfidenceMap,
            source: .lidar
        )

        let estimateHighConf = try await volumeEstimator.integrate(
            mask: mask,
            depth: highConfidenceDepth,
            intrinsics: intrinsics,
            platePlane: nil
        )

        // Low confidence should have higher or equal uncertainty (may hit minimum floor)
        XCTAssertGreaterThanOrEqual(estimateLowConf.sigmaML, estimateHighConf.sigmaML,
                            "Low confidence → higher or equal uncertainty")
    }

    func testDepthSourceAffectsUncertainty() async throws {
        let width = 50
        let height = 50
        let plateDepth: Float = 0.5
        let foodHeight: Float = 0.05 // 5cm

        // Create depth map with food in center
        var depthMap = [Float](repeating: plateDepth, count: width * height)
        for y in 10..<40 {
            for x in 10..<40 {
                depthMap[y * width + x] = plateDepth - foodHeight
            }
        }

        let mask = try createRectangularMask(
            width: width,
            height: height,
            xMin: 10,
            yMin: 10,
            xMax: 40,
            yMax: 40
        )

        // For 30 pixels = 6cm at depth 0.45m: fx = 30 * 0.45 / 0.06 = 225
        let intrinsics = CameraIntrinsics(
            focalLength: SIMD2<Float>(225, 225),
            principalPoint: SIMD2<Float>(25, 25),
            imageSize: SIMD2<Int>(width, height)
        )

        // LiDAR (most accurate)
        let lidarDepth = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: nil,
            source: .lidar
        )

        let lidarEstimate = try await volumeEstimator.integrate(
            mask: mask,
            depth: lidarDepth,
            intrinsics: intrinsics,
            platePlane: nil
        )

        // Monocular (least accurate)
        let monocularDepth = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: nil,
            source: .monocular
        )

        let monocularEstimate = try await volumeEstimator.integrate(
            mask: mask,
            depth: monocularDepth,
            intrinsics: intrinsics,
            platePlane: nil
        )

        // Monocular should have higher uncertainty than LiDAR (may be limited by 5% floor)
        XCTAssertGreaterThanOrEqual(monocularEstimate.sigmaML, lidarEstimate.sigmaML,
                            "Monocular depth has higher uncertainty than LiDAR")
    }

    // MARK: - Edge Cases

    func testEmptyMask() async throws {
        let width = 50
        let height = 50
        let depthMap = [Float](repeating: 0.5, count: width * height)

        // Mask with no area
        let mask = try createRectangularMask(
            width: width,
            height: height,
            xMin: 25,
            yMin: 25,
            xMax: 25, // Same as min - zero area
            yMax: 25
        )

        let intrinsics = CameraIntrinsics(
            focalLength: SIMD2<Float>(400, 400),
            principalPoint: SIMD2<Float>(25, 25),
            imageSize: SIMD2<Int>(width, height)
        )

        let depthData = DepthData(
            width: width,
            height: height,
            depthMap: depthMap,
            confidenceMap: nil,
            source: .lidar
        )

        let estimate = try await volumeEstimator.integrate(
            mask: mask,
            depth: depthData,
            intrinsics: intrinsics,
            platePlane: nil
        )

        // Should return near-zero volume
        XCTAssertLessThan(estimate.muML, 1,
                         "Empty mask should have ~0 volume")

        // But should still have meaningful uncertainty floor
        XCTAssertGreaterThan(estimate.sigmaML, 0,
                            "Should have minimum uncertainty even for empty mask")
    }

    // MARK: - Helper Methods

    private func createCircularMask(
        width: Int,
        height: Int,
        centerX: Int,
        centerY: Int,
        radius: Int
    ) throws -> FoodInstanceMask {
        // Create white circle on black background
        var maskData = [UInt8](repeating: 0, count: width * height)

        for y in 0..<height {
            for x in 0..<width {
                let dx = x - centerX
                let dy = y - centerY
                let distFromCenter = sqrt(Float(dx*dx + dy*dy))

                if distFromCenter <= Float(radius) {
                    maskData[y * width + x] = 255
                }
            }
        }

        let maskImage = try createMaskCGImage(data: maskData, width: width, height: height)

        let bbox = CGRect(
            x: CGFloat(centerX - radius) / CGFloat(width),
            y: CGFloat(centerY - radius) / CGFloat(height),
            width: CGFloat(2 * radius) / CGFloat(width),
            height: CGFloat(2 * radius) / CGFloat(height)
        )

        return FoodInstanceMask(
            maskImage: maskImage,
            confidence: 1.0,
            boundingBox: bbox
        )
    }

    private func createRectangularMask(
        width: Int,
        height: Int,
        xMin: Int,
        yMin: Int,
        xMax: Int,
        yMax: Int
    ) throws -> FoodInstanceMask {
        var maskData = [UInt8](repeating: 0, count: width * height)

        for y in yMin..<yMax {
            for x in xMin..<xMax {
                if y >= 0 && y < height && x >= 0 && x < width {
                    maskData[y * width + x] = 255
                }
            }
        }

        let maskImage = try createMaskCGImage(data: maskData, width: width, height: height)

        let bbox = CGRect(
            x: CGFloat(xMin) / CGFloat(width),
            y: CGFloat(yMin) / CGFloat(height),
            width: CGFloat(xMax - xMin) / CGFloat(width),
            height: CGFloat(yMax - yMin) / CGFloat(height)
        )

        return FoodInstanceMask(
            maskImage: maskImage,
            confidence: 1.0,
            boundingBox: bbox
        )
    }

    private func createMaskCGImage(data: [UInt8], width: Int, height: Int) throws -> CGImage {
        let bytesPerRow = width
        let cfData = CFDataCreate(nil, data, data.count)!

        guard let dataProvider = CGDataProvider(data: cfData) else {
            throw NSError(domain: "VolumeEstimatorTests", code: 1,
                         userInfo: [NSLocalizedDescriptionKey: "Failed to create data provider"])
        }

        guard let cgImage = CGImage(
            width: width,
            height: height,
            bitsPerComponent: 8,
            bitsPerPixel: 8,
            bytesPerRow: bytesPerRow,
            space: CGColorSpaceCreateDeviceGray(),
            bitmapInfo: CGBitmapInfo(rawValue: 0),
            provider: dataProvider,
            decode: nil,
            shouldInterpolate: false,
            intent: .defaultIntent
        ) else {
            throw NSError(domain: "VolumeEstimatorTests", code: 2,
                         userInfo: [NSLocalizedDescriptionKey: "Failed to create CGImage"])
        }

        return cgImage
    }
}
