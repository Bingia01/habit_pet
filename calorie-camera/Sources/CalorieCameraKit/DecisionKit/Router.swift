import Foundation

public struct GeometryEstimate {
    public let label: String
    public let calories: Double
    public let sigma: Double
    public let evidence: [String]

    public init(label: String, calories: Double, sigma: Double, evidence: [String]) {
        self.label = label
        self.calories = calories
        self.sigma = sigma
        self.evidence = evidence
    }
}

public struct RoutedEstimate {
    public let label: String
    public let calories: Double
    public let sigma: Double
    public let evidence: [String]

    public init(label: String, calories: Double, sigma: Double, evidence: [String]) {
        self.label = label
        self.calories = calories
        self.sigma = sigma
        self.evidence = evidence
    }
}

public struct AnalyzerFusionResult {
    public let geometry: GeometryEstimate
    public let routed: RoutedEstimate
    public let fusedCalories: Double
    public let fusedSigma: Double
    public let evidence: [String]
}

public struct AnalyzerRouter {
    private let config: CalorieConfig

    public init(config: CalorieConfig) {
        self.config = config
    }

    public func fuse(
        geometry: GeometryEstimate,
        analyzerObservation: AnalyzerObservation?
    ) -> AnalyzerFusionResult {
        guard
            config.flags.routerEnabled,
            let observation = analyzerObservation
        else {
            return AnalyzerFusionResult(
                geometry: geometry,
                routed: RoutedEstimate(
                    label: geometry.label,
                    calories: geometry.calories,
                    sigma: geometry.sigma,
                    evidence: geometry.evidence
                ),
                fusedCalories: geometry.calories,
                fusedSigma: geometry.sigma,
                evidence: geometry.evidence
            )
        }

        let analyzerSigma = max(geometry.sigma * 0.6, 1.0)
        let routed = RoutedEstimate(
            label: observation.label,
            calories: observation.calories,
            sigma: analyzerSigma,
            evidence: Array(Set(observation.evidence + observation.metaUsed)).sorted()
        )

        if !config.flags.mixtureEnabled {
            return AnalyzerFusionResult(
                geometry: geometry,
                routed: routed,
                fusedCalories: routed.calories,
                fusedSigma: routed.sigma,
                evidence: routed.evidence
            );
        }

        let invVarGeometry = 1.0 / pow(geometry.sigma, 2)
        let invVarRouted = 1.0 / pow(routed.sigma, 2)
        let combinedMu = (geometry.calories * invVarGeometry + routed.calories * invVarRouted) / (invVarGeometry + invVarRouted)
        let combinedSigma = sqrt(1.0 / (invVarGeometry + invVarRouted)) * max(config.correlationPenalty, 1.0)
        let combinedEvidence = Array(Set(geometry.evidence + routed.evidence + ["Analyzer"])).sorted()

        return AnalyzerFusionResult(
            geometry: geometry,
            routed: routed,
            fusedCalories: combinedMu,
            fusedSigma: combinedSigma,
            evidence: combinedEvidence
        )
    }
}
