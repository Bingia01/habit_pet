import CalorieCameraKit
import CoreGraphics

// Simple debug test
func testVolumeDebug() async {
    let width = 10
    let height = 10
    let plateDepth: Float = 0.50 // 50cm
    let foodHeight: Float = 0.05 // 5cm tall food

    var depthMap = [Float](repeating: plateDepth, count: width * height)

    // Make center pixels closer (food on top of plate)
    for y in 3..<7 {
        for x in 3..<7 {
            depthMap[y * width + x] = plateDepth - foodHeight
        }
    }

    print("Depth map sample:")
    for y in 0..<3 {
        for x in 0..<width {
            let d = depthMap[y * width + x]
            print(String(format: "%.2f ", d), terminator: "")
        }
        print("")
    }

    // Create simple full-frame mask
    let maskData = [UInt8](repeating: 255, count: width * height)
    let cfData = CFDataCreate(nil, maskData, maskData.count)!
    let dataProvider = CGDataProvider(data: cfData)!

    let maskImage = CGImage(
        width: width,
        height: height,
        bitsPerComponent: 8,
        bitsPerPixel: 8,
        bytesPerRow: width,
        space: CGColorSpaceCreateDeviceGray(),
        bitmapInfo: CGBitmapInfo(rawValue: 0),
        provider: dataProvider,
        decode: nil,
        shouldInterpolate: false,
        intent: .defaultIntent
    )!

    let mask = FoodInstanceMask(
        maskImage: maskImage,
        confidence: 1.0,
        boundingBox: CGRect(x: 0, y: 0, width: 1, height: 1)
    )

    let intrinsics = CameraIntrinsics(
        focalLength: SIMD2<Float>(50, 50),
        principalPoint: SIMD2<Float>(5, 5),
        imageSize: SIMD2<Int>(width, height)
    )

    let depthData = DepthData(
        width: width,
        height: height,
        depthMap: depthMap,
        confidenceMap: nil,
        source: .lidar
    )

    let estimator = DefaultVolumeEstimator()

    do {
        let result = try await estimator.integrate(
            mask: mask,
            depth: depthData,
            intrinsics: intrinsics,
            platePlane: nil
        )

        print("\nVolume: \(result.muML) mL")
        print("Uncertainty: \(result.sigmaML) mL")
    } catch {
        print("Error: \(error)")
    }
}

await testVolumeDebug()
