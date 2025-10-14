import SwiftUI
import Foundation

/// Public SwiftUI surface for CalorieCameraKit that reacts to feature flags.
public struct CalorieCameraView: View {
    @StateObject private var coordinator: CalorieCameraCoordinator

    private var pathColumns: [GridItem] {
        [GridItem(.adaptive(minimum: 80), spacing: 8)]
    }

    public init(
        config: CalorieConfig = .default,
        onResult: @escaping (CalorieResult) -> Void = { _ in },
        onCancel: (() -> Void)? = nil
    ) {
        _coordinator = StateObject(
            wrappedValue: CalorieCameraCoordinator(
                config: config,
                onResult: onResult,
                onCancel: onCancel
            )
        )
    }

    public var body: some View {
        VStack(spacing: 16) {
            Text("Calorie Camera")
                .font(.title2)
                .bold()

            Text(coordinator.statusMessage)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            if coordinator.isCapturing || coordinator.qualityProgress > 0 {
                ProgressView(value: coordinator.qualityProgress, total: 1.0) {
                    Text("Capture quality")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } currentValueLabel: {
                    Text("\(Int(coordinator.qualityProgress * 100))%")
                        .font(.caption2)
                        .monospacedDigit()
                }
                .progressViewStyle(.linear)
                .tint(.green)
                .accessibilityIdentifier("quality-progress")
            }

            if !coordinator.activePaths.isEmpty {
                LazyVGrid(columns: pathColumns, alignment: .leading, spacing: 8) {
                    ForEach(coordinator.activePaths) { path in
                        Text(path.displayName)
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(path.badgeColor)
                            .foregroundStyle(Color.white)
                            .clipShape(Capsule())
                            .accessibilityLabel(path.accessibilityLabel)
                    }
                }
                .animation(.easeInOut, value: coordinator.activePaths)
            }

            if let question = coordinator.voiQuestion {
                VStack(spacing: 12) {
                    Text(question)
                        .font(.body)
                        .multilineTextAlignment(.center)
                    HStack(spacing: 12) {
                        Button("No") {
                            coordinator.respondToVoI(false)
                        }
                        .buttonStyle(.bordered)
                        .accessibilityIdentifier("voi-no")

                        Button("Yes") {
                            coordinator.respondToVoI(true)
                        }
                        .buttonStyle(.borderedProminent)
                        .accessibilityIdentifier("voi-yes")
                    }
                }
                .padding()
                .background(Color.orange.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .accessibilityElement(children: .combine)
            }

            if let result = coordinator.lastResult {
                VStack(alignment: .leading, spacing: 6) {
                    Text(
                        "Total: \(Int(result.total.mu)) kcal ± \(Int(2 * result.total.sigma))"
                    )
                    .font(.headline)

                    if let item = result.items.first {
                        Text("Evidence: \(item.evidence.joined(separator: ", "))")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .accessibilityIdentifier("evidence-tags")
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.gray.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }

            Spacer(minLength: 12)

            HStack(spacing: 12) {
                Button("Cancel") {
                    coordinator.cancel()
                }
                .buttonStyle(.bordered)
                .disabled(!coordinator.canCancel)

                Button("Capture Sample") {
                    coordinator.startCapture()
                }
                .buttonStyle(.borderedProminent)
                .disabled(!coordinator.canStartCapture)
                .accessibilityIdentifier("capture-button")
            }
        }
        .padding()
        .task {
            await coordinator.prepareSessionIfNeeded()
        }
    }
}

// MARK: - Coordinator

@MainActor
private final class CalorieCameraCoordinator: ObservableObject {
    enum State: Equatable {
        case idle
        case ready
        case capturing
        case awaitingVoI
        case completed
        case failed(String)
    }

    @Published private(set) var state: State = .idle
    @Published private(set) var statusMessage: String = "Preparing capture…"
    @Published private(set) var activePaths: [AnalysisPath] = []
    @Published private(set) var voiQuestion: String?
    @Published private(set) var lastResult: CalorieResult?
    @Published private(set) var qualityProgress: Double = 0.0

    var canStartCapture: Bool {
        switch state {
        case .ready, .completed:
            return true
        default:
            return false
        }
    }

    var canCancel: Bool {
        switch state {
        case .capturing, .awaitingVoI:
            return true
        default:
            return false
        }
    }

    var isCapturing: Bool {
        switch state {
        case .capturing, .awaitingVoI:
            return true
        default:
            return false
        }
    }

    private let config: CalorieConfig
    private let onResult: (CalorieResult) -> Void
    private let onCancel: (() -> Void)?
    private let qualityEstimator: CaptureQualityEstimator
    private let analyzerClient: AnalyzerClient?
    private let routerEngine: AnalyzerRouter
    private var pendingResult: CalorieResult?
    private var askedQuestions = 0

    init(
        config: CalorieConfig,
        onResult: @escaping (CalorieResult) -> Void,
        onCancel: (() -> Void)?
    ) {
        self.config = config
        self.onResult = onResult
        self.onCancel = onCancel
        self.qualityEstimator = CaptureQualityEstimator(parameters: config.captureQuality)
        self.analyzerClient = CalorieCameraCoordinator.makeAnalyzerClient()
        self.routerEngine = AnalyzerRouter(config: config)
        updateActivePaths()
    }

    func prepareSessionIfNeeded() async {
        guard state == .idle else { return }
        statusMessage = "Calibrate camera and hold steady."
        qualityEstimator.reset()
        qualityProgress = 0.0
        do {
            try await Task.sleep(for: .milliseconds(120))
        } catch { }
        state = .ready
        statusMessage = "Ready to capture."
    }

    func startCapture() {
        guard canStartCapture else { return }
        Task { await capture() }
    }

    func respondToVoI(_ answerYes: Bool) {
        guard state == .awaitingVoI, var result = pendingResult else { return }
        askedQuestions += 1
        let evidenceTag = answerYes ? "VoI-Confirmed" : "VoI-Rejected"
        let factor = answerYes ? 0.7 : 0.95

        result = applyVoIAdjustment(
            to: result,
            factor: factor,
            evidenceTag: evidenceTag
        )

        pendingResult = nil
        voiQuestion = nil
        finish(with: result)
    }

    func cancel() {
        switch state {
        case .capturing, .awaitingVoI:
            state = .idle
            statusMessage = "Capture cancelled."
            qualityEstimator.reset()
            qualityProgress = 0.0
            pendingResult = nil
            voiQuestion = nil
            onCancel?()
        default:
            break
        }
    }

    private func capture() async {
        state = .capturing
        qualityEstimator.reset()
        qualityProgress = 0.0
        statusMessage = "Move around the plate to hit quality threshold."

        let qualityStatus = await performQualityGate()
        if qualityStatus?.shouldStop == true {
            statusMessage = "Analyzing capture…"
        } else {
            statusMessage = "Analyzing best-effort capture…"
        }

        let geometryPath = PathEstimate(
            path: .geometry,
            mu: 430,
            sigma: 70,
            evidence: ["Depth"]
        )

        var analyzerObservation: AnalyzerObservation?
        if let analyzerClient {
            do {
                analyzerObservation = try await analyzerClient.analyze(
                    imageData: placeholderImageData(),
                    mimeType: "image/png"
                )
            } catch {
                print("[CalorieCamera] analyzer request failed:", error)
            }
        }

        let geometryEstimate = GeometryEstimate(
            label: geometryPath.path.displayName,
            calories: geometryPath.mu,
            sigma: geometryPath.sigma,
            evidence: geometryPath.evidence
        )

        let fusion = routerEngine.fuse(
            geometry: geometryEstimate,
            analyzerObservation: analyzerObservation
        )

        let finalLabel = analyzerObservation?.label ?? geometryPath.path.displayName
        let finalEvidence = Array(
            Set(
                fusion.evidence
                    + geometryPath.evidence
                    + (analyzerObservation?.evidence ?? [])
            )
        ).sorted()

        let finalCalories = fusion.fusedCalories
        let finalSigma = fusion.fusedSigma

        let finalPath: AnalysisPath
        if config.flags.mixtureEnabled, analyzerObservation != nil {
            finalPath = .mixture
        } else if analyzerObservation != nil {
            finalPath = .analyzer
        } else {
            finalPath = .geometry
        }

        let item = ItemEstimate(
            label: finalLabel,
            volumeML: 360,
            calories: finalCalories,
            sigma: finalSigma,
            evidence: finalEvidence
        )

        let result = CalorieResult(
            items: [item],
            total: (mu: finalCalories, sigma: finalSigma)
        )

        if finalPath == .analyzer || finalPath == .mixture {
            statusMessage = "Analyzer results fused."
        }

        if shouldAskVoI(for: result) {
            pendingResult = result
            voiQuestion = nextVoIQuestion()
            state = .awaitingVoI
            statusMessage = "Need extra clarification."
        } else {
            finish(with: result)
        }
    }

    private func finish(with result: CalorieResult) {
        state = .completed
        statusMessage = "Capture complete."
        qualityProgress = 1.0
        lastResult = result
        onResult(result)
    }

    private func updateActivePaths() {
        var order: [AnalysisPath] = []
        if config.flags.routerEnabled {
            order.append(contentsOf: [.analyzer, .router, .label, .menu])
        }
        order.append(.geometry)
        if config.flags.mixtureEnabled {
            order.append(.mixture)
        }
        activePaths = order.reduce(into: [AnalysisPath]()) { partial, path in
            if !partial.contains(path) {
                partial.append(path)
            }
        }
    }

    private func shouldAskVoI(for result: CalorieResult) -> Bool {
        guard config.flags.voiEnabled,
              askedQuestions == 0 else { return false }
        return result.totalRelativeUncertainty >= config.voiThreshold
    }

    private func nextVoIQuestion() -> String {
        if let candidate = config.askBinaryPool.first {
            return "Is the dish \(candidate)?"
        }
        return "Does this plate include sauce or dressing?"
    }

    private func applyVoIAdjustment(
        to result: CalorieResult,
        factor: Double,
        evidenceTag: String
    ) -> CalorieResult {
        guard let item = result.items.first else { return result }
        let adjustedSigma = max(item.sigma * factor, 1.0)
        let adjustedItem = ItemEstimate(
            id: item.id,
            label: item.label,
            volumeML: item.volumeML,
            calories: item.calories,
            sigma: adjustedSigma,
            evidence: Array(Set(item.evidence + [evidenceTag])).sorted()
        )
        let adjustedTotal = (mu: result.total.mu, sigma: max(result.total.sigma * factor, 1.0))
        return CalorieResult(items: [adjustedItem], total: adjustedTotal)
    }

    private static func makeAnalyzerClient() -> AnalyzerClient? {
        let environment = ProcessInfo.processInfo.environment
        let candidates = [
            environment["ANALYZER_BASE_URL"],
            environment["WEB_BASE"]
        ]

        guard
            let urlString = candidates.compactMap({ $0 }).first,
            let url = URL(string: urlString)
        else {
            return nil
        }

        return HTTPAnalyzerClient(
            configuration: .init(baseURL: url)
        )
    }

    private static let placeholderImage: Data = {
        Data(
            base64Encoded: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAwMB/6XGMZkAAAAASUVORK5CYII="
        ) ?? Data()
    }()

    private func placeholderImageData() -> Data {
        Self.placeholderImage
    }

    private func performQualityGate() async -> CaptureQualityStatus? {
        var latestStatus: CaptureQualityStatus?
        for sample in generateMockQualitySamples() {
            guard state == .capturing else { break }
            let status = qualityEstimator.evaluate(sample: sample)
            latestStatus = status
            updateQualityStatus(status)

            if status.shouldStop {
                break
            }

            try? await Task.sleep(for: .milliseconds(90))
        }
        return latestStatus
    }

    private func updateQualityStatus(_ status: CaptureQualityStatus) {
        qualityProgress = status.progress

        if status.shouldStop {
            statusMessage = "Quality locked. Processing capture…"
            return
        }

        if !status.meetsTracking {
            statusMessage = "Hold steady to restore tracking…"
        } else if !status.meetsParallax {
            statusMessage = "Move around the plate for more viewpoints."
        } else if !status.meetsDepth {
            statusMessage = "Lower the device slightly to capture depth."
        } else {
            statusMessage = "Gathering more frames…"
        }
    }

    private func generateMockQualitySamples() -> [CaptureQualitySample] {
        let params = config.captureQuality
        let steps = max(params.minimumStableFrames + 3, 5)
        let parallaxStep = params.parallaxTarget / Double(steps - 1)
        let depthStep = params.depthCoverageTarget / Double(steps)

        var samples: [CaptureQualitySample] = []
        var parallax = 0.0
        var depth = params.depthCoverageTarget * 0.4

        for index in 0..<steps {
            parallax = min(params.parallaxTarget * 1.1, parallax + parallaxStep)
            depth = min(1.0, depth + depthStep)
            let state: TrackingState = index < 1 ? .limited : .normal

            samples.append(
                CaptureQualitySample(
                    timestamp: Date(),
                    parallax: parallax,
                    trackingState: state,
                    depthCoverage: depth
                )
            )
        }

        return samples
    }
}

// MARK: - Helpers

private struct PathEstimate {
    let path: AnalysisPath
    let mu: Double
    let sigma: Double
    let evidence: [String]
}

private enum AnalysisPath: String, CaseIterable, Identifiable {
    case analyzer
    case router
    case label
    case menu
    case geometry
    case mixture

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .analyzer:
            return "Analyzer"
        case .router:
            return "Router"
        case .label:
            return "Label"
        case .menu:
            return "Menu"
        case .geometry:
            return "Geometry"
        case .mixture:
            return "Mixture"
        }
    }

    var accessibilityLabel: String {
        switch self {
        case .analyzer:
            return "Analyzer path active"
        case .router:
            return "Router path active"
        case .label:
            return "Label path active"
        case .menu:
            return "Menu path active"
        case .geometry:
            return "Geometry path active"
        case .mixture:
            return "Mixture fusion active"
        }
    }

    var badgeColor: Color {
        switch self {
        case .analyzer:
            return .teal
        case .router:
            return .blue
        case .label:
            return .purple
        case .menu:
            return .orange
        case .geometry:
            return .green
        case .mixture:
            return .pink
        }
    }
}
