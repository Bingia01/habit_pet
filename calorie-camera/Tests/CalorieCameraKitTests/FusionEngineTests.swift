import XCTest
@testable import CalorieCameraKit

final class FusionEngineTests: XCTestCase {

    var fusionEngine: FusionEngine!

    override func setUp() {
        super.setUp()
        fusionEngine = FusionEngine(config: .default)
    }

    override func tearDown() {
        fusionEngine = nil
        super.tearDown()
    }

    // MARK: - Delta Method Tests

    /// Test delta method with spec example:
    /// V = 180 ± 30 ml
    /// ρ = 0.85 ± 0.10 g/ml
    /// e = 1.30 ± 0.05 kcal/g
    /// Expected: μ ≈ 199 kcal, σ ≈ 37-41 kcal
    func testDeltaMethodSpecExample() throws {
        let volume = VolumeEstimate(muML: 180, sigmaML: 30)
        let priors = FoodPriors(
            density: PriorStats(mu: 0.85, sigma: 0.10),
            kcalPerG: PriorStats(mu: 1.30, sigma: 0.05)
        )

        let estimate = fusionEngine.caloriesFromGeometry(
            volume: volume,
            priors: priors
        )

        // Check mean: 180 × 0.85 × 1.30 = 199.05
        XCTAssertEqual(estimate.mu, 199.05, accuracy: 0.5,
                      "Mean should be ~199 kcal")

        // Check sigma is in expected range [37, 41]
        XCTAssertGreaterThan(estimate.sigma, 36.0,
                            "Sigma should be > 36 kcal")
        XCTAssertLessThan(estimate.sigma, 42.0,
                         "Sigma should be < 42 kcal")

        // Relative uncertainty should be reasonable (~20%)
        let relUncertainty = estimate.relativeUncertainty
        XCTAssertLessThan(relUncertainty, 0.25,
                         "Relative uncertainty should be < 25%")
    }

    func testDeltaMethodHighPrecisionCase() throws {
        // Low uncertainty in all parameters
        let volume = VolumeEstimate(muML: 200, sigmaML: 10)
        let priors = FoodPriors(
            density: PriorStats(mu: 1.0, sigma: 0.02),
            kcalPerG: PriorStats(mu: 1.5, sigma: 0.03)
        )

        let estimate = fusionEngine.caloriesFromGeometry(
            volume: volume,
            priors: priors
        )

        // Mean: 200 × 1.0 × 1.5 = 300
        XCTAssertEqual(estimate.mu, 300, accuracy: 0.1)

        // Sigma should be low (high precision)
        XCTAssertLessThan(estimate.sigma, 20,
                         "High precision inputs → low output uncertainty")
    }

    func testDeltaMethodHighUncertaintyCase() throws {
        // High uncertainty in parameters
        let volume = VolumeEstimate(muML: 150, sigmaML: 50)
        let priors = FoodPriors(
            density: PriorStats(mu: 0.8, sigma: 0.2),
            kcalPerG: PriorStats(mu: 1.2, sigma: 0.3)
        )

        let estimate = fusionEngine.caloriesFromGeometry(
            volume: volume,
            priors: priors
        )

        // Sigma should be high
        XCTAssertGreaterThan(estimate.sigma, 40,
                            "High input uncertainty → high output uncertainty")
    }

    // MARK: - Fusion Tests

    func testInverseVarianceWeightedFusion() throws {
        let estimate1 = Estimate(mu: 200, sigma: 40, source: .geometry)
        let estimate2 = Estimate(mu: 180, sigma: 20, source: .menu)

        let fused = fusionEngine.fuse([estimate1, estimate2])

        // Fused mean should be closer to more precise estimate (estimate2)
        XCTAssertLessThan(abs(fused.mu - 180), abs(fused.mu - 200),
                         "Fused mean should be closer to more precise estimate")

        // Fused sigma should be lower than either input
        XCTAssertLessThan(fused.sigma, estimate1.sigma,
                         "Fused uncertainty < estimate1")
        XCTAssertLessThan(fused.sigma, estimate2.sigma,
                         "Fused uncertainty < estimate2")
    }

    func testFusionReducesUncertainty() throws {
        let estimate1 = Estimate(mu: 250, sigma: 50, source: .geometry)
        let estimate2 = Estimate(mu: 240, sigma: 50, source: .label)

        let fused = fusionEngine.fuse([estimate1, estimate2])

        // Fused uncertainty should be ≈ σ/sqrt(2) ≈ 35 for equal precision
        let expectedSigma = 50 / sqrt(2.0)
        XCTAssertEqual(fused.sigma, expectedSigma, accuracy: 5,
                      "Fused σ ≈ σ/√2 for equal precision estimates")
    }

    func testFusionSingleEstimate() throws {
        let estimate = Estimate(mu: 300, sigma: 40, source: .geometry)

        let fused = fusionEngine.fuse([estimate])

        // Single estimate should be unchanged
        XCTAssertEqual(fused.mu, estimate.mu)
        XCTAssertEqual(fused.sigma, estimate.sigma)
        XCTAssertEqual(fused.source, estimate.source)
    }

    func testFusionEmptyArray() throws {
        let fused = fusionEngine.fuse([])

        // Should return invalid estimate
        XCTAssertTrue(fused.sigma.isInfinite)
    }

    func testFusionWithCorrelationPenalty() throws {
        let config = CalorieConfig(correlationPenalty: 1.5)
        let engine = FusionEngine(config: config)

        let estimate1 = Estimate(mu: 200, sigma: 30, source: .menu)
        let estimate2 = Estimate(mu: 210, sigma: 30, source: .geometry)

        let fused = engine.fuse([estimate1, estimate2])

        // With correlation penalty, σ should be larger
        let expectedBase = 30 / sqrt(2.0)
        XCTAssertGreaterThan(fused.sigma, expectedBase,
                            "Correlation penalty increases uncertainty")
    }

    // MARK: - Meal Total Tests

    func testSumItemsUncertaintyPropagation() throws {
        let items = [
            ItemEstimate(label: "rice", volumeML: 180, calories: 200, sigma: 30, evidence: []),
            ItemEstimate(label: "chicken", volumeML: 150, calories: 250, sigma: 40, evidence: [])
        ]

        let (muTotal, sigmaTotal) = fusionEngine.sumItems(items)

        // Mean: 200 + 250 = 450
        XCTAssertEqual(muTotal, 450, accuracy: 0.1)

        // Uncertainty adds in quadrature: sqrt(30² + 40²) = sqrt(2500) = 50
        XCTAssertEqual(sigmaTotal, 50, accuracy: 0.5)
    }

    func testSumItemsMultipleItems() throws {
        let items = [
            ItemEstimate(label: "item1", volumeML: 100, calories: 100, sigma: 15, evidence: []),
            ItemEstimate(label: "item2", volumeML: 100, calories: 100, sigma: 15, evidence: []),
            ItemEstimate(label: "item3", volumeML: 100, calories: 100, sigma: 15, evidence: [])
        ]

        let (muTotal, sigmaTotal) = fusionEngine.sumItems(items)

        // Mean: 300
        XCTAssertEqual(muTotal, 300)

        // Uncertainty: sqrt(15² + 15² + 15²) = sqrt(675) ≈ 26
        XCTAssertEqual(sigmaTotal, sqrt(675), accuracy: 0.1)
    }

    // MARK: - Label and Menu Calculators

    func testCaloriesFromLabel() throws {
        let volume = VolumeEstimate(muML: 120, sigmaML: 10)
        let kcalPerServing = 150.0
        let servingVolumeML = 100.0

        let estimate = fusionEngine.caloriesFromLabel(
            volume: volume,
            kcalPerServing: kcalPerServing,
            servingVolumeML: servingVolumeML
        )

        // Mean: (120/100) × 150 = 180
        XCTAssertEqual(estimate.mu, 180, accuracy: 0.1)

        // Sigma: (150/100) × 10 = 15
        XCTAssertEqual(estimate.sigma, 15, accuracy: 0.1)

        XCTAssertEqual(estimate.source, .label)
    }

    func testCaloriesFromMenu() throws {
        let volume = VolumeEstimate(muML: 200, sigmaML: 20)
        let kcalPerItem = 400.0
        let refVolumeML = 250.0

        let estimate = fusionEngine.caloriesFromMenu(
            volume: volume,
            kcalPerItem: kcalPerItem,
            referenceVolumeML: refVolumeML,
            preparationVariance: 0.15
        )

        // Mean: (200/250) × 400 = 320
        XCTAssertEqual(estimate.mu, 320, accuracy: 0.1)

        // Sigma includes both volume and prep variance
        XCTAssertGreaterThan(estimate.sigma, 30,
                            "Menu estimates have higher uncertainty")

        XCTAssertEqual(estimate.source, .menu)
    }

    // MARK: - Edge Cases

    func testZeroVolume() throws {
        let volume = VolumeEstimate(muML: 0, sigmaML: 0)
        let priors = FoodPriors(
            density: PriorStats(mu: 1.0, sigma: 0.1),
            kcalPerG: PriorStats(mu: 1.5, sigma: 0.1)
        )

        let estimate = fusionEngine.caloriesFromGeometry(
            volume: volume,
            priors: priors
        )

        XCTAssertEqual(estimate.mu, 0, accuracy: 0.01)
    }

    func testVeryHighUncertainty() throws {
        let volume = VolumeEstimate(muML: 100, sigmaML: 200)
        let priors = FoodPriors(
            density: PriorStats(mu: 1.0, sigma: 0.5),
            kcalPerG: PriorStats(mu: 1.0, sigma: 0.5)
        )

        let estimate = fusionEngine.caloriesFromGeometry(
            volume: volume,
            priors: priors
        )

        // Relative uncertainty should be very high
        XCTAssertGreaterThan(estimate.relativeUncertainty, 1.0,
                            "High input uncertainty → rel. unc. > 100%")
    }
}

// MARK: - Router Tests

final class RouterTests: XCTestCase {

    var router: Router!

    override func setUp() {
        super.setUp()
        let config = CalorieConfig(
            flags: FeatureFlags(routerEnabled: true, voiEnabled: false, mixtureEnabled: false),
            routerWeights: RouterWeights(label: 0.6, menu: 0.5, geo: 0.7)
        )
        router = Router(config: config)
    }

    func testRouterPrefersLabel() throws {
        let evidence = RouterEvidence(
            hasBarcode: true,
            hasMenuMatch: false,
            geometryQuality: 0.8,
            confidences: [:]
        )

        let paths = router.choosePaths(evidence: evidence)

        XCTAssertTrue(paths.contains(.label),
                     "Should include label when barcode available")
    }

    func testRouterFallbackToGeometry() throws {
        let evidence = RouterEvidence(
            hasBarcode: false,
            hasMenuMatch: false,
            geometryQuality: 0.6,
            confidences: [:]
        )

        let paths = router.choosePaths(evidence: evidence)

        XCTAssertTrue(paths.contains(.geometry),
                     "Should fall back to geometry")
    }

    func testRouterMenuWithHighConfidence() throws {
        let evidence = RouterEvidence(
            hasBarcode: false,
            hasMenuMatch: true,
            geometryQuality: 0.7,
            confidences: [.menu: 0.9]
        )

        let paths = router.choosePaths(evidence: evidence)

        XCTAssertTrue(paths.contains(.menu),
                     "Should use menu with high confidence")
    }
}

// MARK: - Value of Information Tests

final class ValueOfInformationTests: XCTestCase {

    func testShouldAskWhenHighUncertainty() throws {
        let config = CalorieConfig(
            voiThreshold: 0.27,
            flags: FeatureFlags(voiEnabled: true),
            askBinaryPool: ["creamBase", "clearBroth"]
        )

        let estimate = Estimate(mu: 200, sigma: 60, source: .geometry)
        // Relative uncertainty: 60/200 = 0.30 > 0.27

        let question = ValueOfInformation.shouldAsk(
            estimate: estimate,
            threshold: config.voiThreshold,
            config: config
        )

        XCTAssertNotNil(question,
                       "Should ask question when uncertainty high")
        XCTAssertEqual(question, "creamBase",
                      "Should return first question from pool")
    }

    func testShouldNotAskWhenLowUncertainty() throws {
        let config = CalorieConfig(
            voiThreshold: 0.27,
            flags: FeatureFlags(voiEnabled: true),
            askBinaryPool: ["creamBase"]
        )

        let estimate = Estimate(mu: 200, sigma: 40, source: .label)
        // Relative uncertainty: 40/200 = 0.20 < 0.27

        let question = ValueOfInformation.shouldAsk(
            estimate: estimate,
            threshold: config.voiThreshold,
            config: config
        )

        XCTAssertNil(question,
                    "Should not ask when uncertainty acceptable")
    }

    func testVoIDisabled() throws {
        let config = CalorieConfig(
            flags: FeatureFlags(voiEnabled: false),
            askBinaryPool: ["question"]
        )

        let estimate = Estimate(mu: 100, sigma: 50, source: .geometry)

        let question = ValueOfInformation.shouldAsk(
            estimate: estimate,
            threshold: 0.2,
            config: config
        )

        XCTAssertNil(question, "Should not ask when VoI disabled")
    }
}
