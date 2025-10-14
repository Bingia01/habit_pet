import Foundation
import CoreGraphics
import CoreImage
import simd

#if canImport(UIKit)
import UIKit
#endif

// MARK: - Segmentation Types

/// A single segmented food instance
public struct FoodInstanceMask: Sendable, Identifiable {
    public let id: UUID
    public let maskImage: CGImage  // Binary mask
    public let confidence: Double  // 0-1
    public let boundingBox: CGRect // Normalized 0-1

    public init(
        id: UUID = UUID(),
        maskImage: CGImage,
        confidence: Double,
        boundingBox: CGRect
    ) {
        self.id = id
        self.maskImage = maskImage
        self.confidence = confidence
        self.boundingBox = boundingBox
    }
}

/// Classification result for a food instance
public struct ClassResult: Sendable {
    public let topLabel: String
    public let confidence: Double
    public let mixture: [String: Double]?  // For mixed dishes

    public init(
        topLabel: String,
        confidence: Double,
        mixture: [String: Double]? = nil
    ) {
        self.topLabel = topLabel
        self.confidence = confidence
        self.mixture = mixture
    }
}

// MARK: - Protocols

/// Segments an image into individual food instances
public protocol Segmenter: Sendable {
    /// Segment captured frame into food instances
    ///
    /// - Parameter frame: RGB image with optional depth
    /// - Returns: Array of segmented food masks
    func segment(frame: CapturedFrame) async throws -> [FoodInstanceMask]
}

/// Classifies a food instance
public protocol Classifier: Sendable {
    /// Classify a segmented food instance
    ///
    /// - Parameters:
    ///   - instance: Segmented mask
    ///   - frames: Multiple frames for temporal coherence
    /// - Returns: Classification result
    func classify(
        instance: FoodInstanceMask,
        frames: [FrameSample]
    ) async throws -> ClassResult
}

/// Estimates volume from depth and mask
public protocol VolumeEstimator: Sendable {
    /// Estimate volume of segmented instance
    ///
    /// - Parameters:
    ///   - mask: Food instance mask
    ///   - depth: Depth map
    ///   - intrinsics: Camera intrinsics
    ///   - platePlane: Reference plane equation
    /// - Returns: Volume estimate with uncertainty
    func integrate(
        mask: FoodInstanceMask,
        depth: DepthData,
        intrinsics: CameraIntrinsics,
        platePlane: PlaneEquation?
    ) async throws -> VolumeEstimate
}

// MARK: - Supporting Types

/// Frame sample for multi-frame processing
public struct FrameSample: Sendable {
    public let pixelBuffer: Data  // RGB image data
    public let depth: DepthData?
    public let intrinsics: CameraIntrinsics?
    public let transform: simd_float4x4  // Camera pose
    public let timestamp: TimeInterval

    public init(
        pixelBuffer: Data,
        depth: DepthData?,
        intrinsics: CameraIntrinsics?,
        transform: simd_float4x4,
        timestamp: TimeInterval
    ) {
        self.pixelBuffer = pixelBuffer
        self.depth = depth
        self.intrinsics = intrinsics
        self.transform = transform
        self.timestamp = timestamp
    }
}

/// Plane equation: ax + by + cz + d = 0
public struct PlaneEquation: Sendable {
    public let normal: SIMD3<Float>  // (a, b, c)
    public let distance: Float       // d

    public init(normal: SIMD3<Float>, distance: Float) {
        self.normal = normal
        self.distance = distance
    }

    /// Distance from point to plane
    public func distanceToPoint(_ point: SIMD3<Float>) -> Float {
        return dot(normal, point) + distance
    }
}

// MARK: - Default Implementations (Stubs)

/// Default segmenter returns single "whole-plate" mask
public final class DefaultSegmenter: Segmenter {

    public init() {}

    public func segment(frame: CapturedFrame) async throws -> [FoodInstanceMask] {
        // TODO: Replace with CoreML segmentation model
        // For now, return single mask covering whole image

        guard let cgImage = createCGImage(from: frame.rgbImage) else {
            throw CalorieCameraError.processingFailed("Cannot create image")
        }

        let width = cgImage.width
        let height = cgImage.height

        // Create full-frame mask
        let maskImage = try createFullMask(width: width, height: height)

        return [FoodInstanceMask(
            maskImage: maskImage,
            confidence: 1.0,
            boundingBox: CGRect(x: 0, y: 0, width: 1, height: 1)
        )]
    }

    private func createFullMask(width: Int, height: Int) throws -> CGImage {
        // Create white mask (all pixels = 255)
        let bytesPerPixel = 1
        let bytesPerRow = width * bytesPerPixel
        let bitmapData = [UInt8](repeating: 255, count: width * height)

        guard let dataProvider = CGDataProvider(data: Data(bitmapData) as CFData) else {
            throw CalorieCameraError.processingFailed("Cannot create data provider")
        }

        guard let maskImage = CGImage(
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
            throw CalorieCameraError.processingFailed("Cannot create mask image")
        }

        return maskImage
    }

    private func createCGImage(from data: Data) -> CGImage? {
        #if canImport(UIKit)
        guard let uiImage = UIKit.UIImage(data: data) else { return nil }
        return uiImage.cgImage
        #else
        return nil
        #endif
    }
}

/// Default classifier returns mock result
public final class DefaultClassifier: Classifier {

    public init() {}

    public func classify(
        instance: FoodInstanceMask,
        frames: [FrameSample]
    ) async throws -> ClassResult {
        // TODO: Replace with CoreML classification model
        // For now, return mock classification

        return ClassResult(
            topLabel: "rice:white_cooked",
            confidence: 0.9,
            mixture: nil
        )
    }
}

/// Default volume estimator with placeholder logic
public final class DefaultVolumeEstimator: VolumeEstimator {

    public init() {}

    public func integrate(
        mask: FoodInstanceMask,
        depth: DepthData,
        intrinsics: CameraIntrinsics,
        platePlane: PlaneEquation?
    ) async throws -> VolumeEstimate {
        // TODO: Implement proper 3D integration using depth map
        // For now, estimate based on bounding box and average depth

        let maskArea = mask.boundingBox.width * mask.boundingBox.height

        // Estimate volume assuming cylindrical shape
        // V ≈ area × avgHeight
        let avgDepth = computeAverageDepth(
            depthMap: depth.depthMap,
            mask: mask,
            width: depth.width,
            height: depth.height
        )

        // Convert to volume (very rough estimate)
        let estimatedVolumeML = maskArea * Double(avgDepth) * 1000.0 * 180.0 // Scale factor

        // High uncertainty for this placeholder
        let uncertainty = estimatedVolumeML * 0.30  // 30% uncertainty

        return VolumeEstimate(muML: estimatedVolumeML, sigmaML: uncertainty)
    }

    private func computeAverageDepth(
        depthMap: [Float],
        mask: FoodInstanceMask,
        width: Int,
        height: Int
    ) -> Float {
        // Simplified: average depth in bounding box
        let bbox = mask.boundingBox

        let xStart = Int(bbox.origin.x * CGFloat(width))
        let yStart = Int(bbox.origin.y * CGFloat(height))
        let xEnd = Int((bbox.origin.x + bbox.width) * CGFloat(width))
        let yEnd = Int((bbox.origin.y + bbox.height) * CGFloat(height))

        var sum: Float = 0
        var count = 0

        for y in yStart..<min(yEnd, height) {
            for x in xStart..<min(xEnd, width) {
                let idx = y * width + x
                if idx < depthMap.count {
                    let depth = depthMap[idx]
                    if depth > 0 && depth < 10 {  // Valid depth range
                        sum += depth
                        count += 1
                    }
                }
            }
        }

        return count > 0 ? sum / Float(count) : 0.5
    }
}

// MARK: - Error Extension

extension CalorieCameraError {
    static func processingFailed(_ message: String) -> CalorieCameraError {
        return .detectionFailure(message)
    }
}
