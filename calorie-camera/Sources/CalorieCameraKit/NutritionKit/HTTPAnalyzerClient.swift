import Foundation

public struct AnalyzerObservation: Sendable {
    public let label: String
    public let confidence: Double
    public let calories: Double
    public let weightGrams: Double
    public let evidence: [String]
    public let metaUsed: [String]

    public init(
        label: String,
        confidence: Double,
        calories: Double,
        weightGrams: Double,
        evidence: [String],
        metaUsed: [String]
    ) {
        self.label = label
        self.confidence = confidence
        self.calories = calories
        self.weightGrams = weightGrams
        self.evidence = evidence
        self.metaUsed = metaUsed
    }
}

public protocol AnalyzerClient: Sendable {
    func analyze(imageData: Data, mimeType: String) async throws -> AnalyzerObservation
}

public struct HTTPAnalyzerClient: AnalyzerClient {
    public struct Configuration: Sendable {
        public let baseURL: URL
        public let endpointPath: String
        public let timeout: TimeInterval

        public init(
            baseURL: URL,
            endpointPath: String = "/api/analyze-food",
            timeout: TimeInterval = 20.0
        ) {
            self.baseURL = baseURL
            self.endpointPath = endpointPath
            self.timeout = timeout
        }
    }

    private let configuration: Configuration
    private let urlSession: URLSession

    public init(
        configuration: Configuration,
        urlSession: URLSession = .shared
    ) {
        self.configuration = configuration
        self.urlSession = urlSession
    }

    public func analyze(imageData: Data, mimeType: String) async throws -> AnalyzerObservation {
        var request = URLRequest(
            url: configuration.baseURL.appendingPathComponent(configuration.endpointPath)
        )
        request.httpMethod = "POST"
        request.timeoutInterval = configuration.timeout
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let payload = AnalyzerRequestPayload(
            imageBase64: imageData.base64EncodedString(),
            mimeType: mimeType
        )
        request.httpBody = try JSONEncoder().encode(payload)

        let (data, response) = try await urlSession.data(for: request)

        guard
            let httpResponse = response as? HTTPURLResponse,
            (200..<300).contains(httpResponse.statusCode)
        else {
            let status = (response as? HTTPURLResponse)?.statusCode ?? -1
            let body = String(data: data, encoding: .utf8) ?? "n/a"
            throw AnalyzerClientError.server(status: status, body: body)
        }

        let decoded: AnalyzerResponsePayload
        do {
            decoded = try JSONDecoder().decode(AnalyzerResponsePayload.self, from: data)
        } catch {
            throw AnalyzerClientError.decoding(error)
        }
        return AnalyzerObservation(
            label: decoded.foodType,
            confidence: decoded.confidence,
            calories: decoded.calories,
            weightGrams: decoded.weight,
            evidence: decoded.evidence ?? [],
            metaUsed: decoded.meta?.used ?? []
        )
    }
}

public enum AnalyzerClientError: Error, LocalizedError {
    case server(status: Int, body: String)
    case decoding(Error)

    public var errorDescription: String? {
        switch self {
        case .server(let status, let body):
            return "Analyzer server error \(status): \(body)"
        case .decoding(let error):
            return "Analyzer decoding error: \(error.localizedDescription)"
        }
    }
}

private struct AnalyzerRequestPayload: Encodable {
    let imageBase64: String
    let mimeType: String
}

private struct AnalyzerResponsePayload: Decodable {
    struct Meta: Decodable {
        let used: [String]?
        let latencyMs: Double?
    }

    let foodType: String
    let confidence: Double
    let calories: Double
    let weight: Double
    let emoji: String?
    let portionSizes: [String]?
    let evidence: [String]?
    let meta: Meta?
}
