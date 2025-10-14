import XCTest
@testable import CalorieCameraKit

final class CaptureQualityEstimatorTests: XCTestCase {
    func testEstimatorReachesThresholdWithStableTracking() throws {
        let parameters = CaptureQualityParameters(
            parallaxTarget: 0.2,
            depthCoverageTarget: 0.5,
            parallaxWeight: 0.4,
            depthWeight: 0.4,
            trackingWeight: 0.2,
            minimumStableFrames: 2,
            stopThreshold: 0.75
        )

        let estimator = CaptureQualityEstimator(parameters: parameters)

        let first = estimator.evaluate(
            sample: CaptureQualitySample(
                parallax: 0.05,
                trackingState: .limited,
                depthCoverage: 0.2
            )
        )

        XCTAssertFalse(first.shouldStop)
        XCTAssertFalse(first.meetsTracking)
        XCTAssertLessThan(first.score, 0.6)

        let second = estimator.evaluate(
            sample: CaptureQualitySample(
                parallax: 0.14,
                trackingState: .normal,
                depthCoverage: 0.35
            )
        )

        XCTAssertFalse(second.shouldStop)
        XCTAssertEqual(second.meetsTracking, false)

        let third = estimator.evaluate(
            sample: CaptureQualitySample(
                parallax: 0.22,
                trackingState: .normal,
                depthCoverage: 0.55
            )
        )

        XCTAssertTrue(third.meetsTracking)
        XCTAssertTrue(third.meetsParallax)
        XCTAssertTrue(third.meetsDepth)
        XCTAssertTrue(third.shouldStop)
        XCTAssertGreaterThanOrEqual(third.progress, 1.0)
    }

    func testTrackingBreakResetsStableRequirement() {
        let parameters = CaptureQualityParameters(
            parallaxTarget: 0.25,
            depthCoverageTarget: 0.6,
            parallaxWeight: 0.4,
            depthWeight: 0.4,
            trackingWeight: 0.2,
            minimumStableFrames: 2,
            stopThreshold: 0.8
        )

        let estimator = CaptureQualityEstimator(parameters: parameters)

        _ = estimator.evaluate(
            sample: CaptureQualitySample(
                parallax: 0.2,
                trackingState: .normal,
                depthCoverage: 0.55
            )
        )

        let interrupt = estimator.evaluate(
            sample: CaptureQualitySample(
                parallax: 0.22,
                trackingState: .limited,
                depthCoverage: 0.6
            )
        )

        XCTAssertFalse(interrupt.shouldStop)
        XCTAssertFalse(interrupt.meetsTracking)

        let recovery = estimator.evaluate(
            sample: CaptureQualitySample(
                parallax: 0.26,
                trackingState: .normal,
                depthCoverage: 0.7
            )
        )

        XCTAssertFalse(recovery.shouldStop)
        XCTAssertTrue(recovery.meetsParallax)
        XCTAssertTrue(recovery.meetsDepth)
        XCTAssertFalse(recovery.meetsTracking)

        let final = estimator.evaluate(
            sample: CaptureQualitySample(
                parallax: 0.27,
                trackingState: .normal,
                depthCoverage: 0.72
            )
        )

        XCTAssertTrue(final.meetsTracking)
        XCTAssertTrue(final.shouldStop)
    }
}
