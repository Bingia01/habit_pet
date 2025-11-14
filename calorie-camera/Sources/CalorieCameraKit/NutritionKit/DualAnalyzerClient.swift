import Foundation

/// Dual analyzer client that implements fallback chain: Next.js API → Supabase Edge Function
public struct DualAnalyzerClient: AnalyzerClient {
    public struct Configuration: Sendable {
        public let nextjsAPIURL: URL?  // Primary: Next.js API route
        public let supabaseURL: URL     // Fallback: Supabase Edge Function
        public let supabaseAPIKey: String
        public let timeout: TimeInterval
        
        public init(
            nextjsAPIURL: URL?,
            supabaseURL: URL,
            supabaseAPIKey: String,
            timeout: TimeInterval = 20.0
        ) {
            self.nextjsAPIURL = nextjsAPIURL
            self.supabaseURL = supabaseURL
            self.supabaseAPIKey = supabaseAPIKey
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
        // Try Next.js API first (if configured)
        if let nextjsURL = configuration.nextjsAPIURL {
            do {
                NSLog("🔄 [DualAnalyzer] Trying Next.js API first...")
                return try await analyzeViaNextJS(imageData: imageData, mimeType: mimeType, url: nextjsURL)
            } catch {
                NSLog("⚠️ [DualAnalyzer] Next.js API failed: \(error), falling back to Supabase")
                // Continue to fallback
            }
        }
        
        // Fallback to Supabase Edge Function
        NSLog("🔄 [DualAnalyzer] Using Supabase Edge Function fallback...")
        return try await analyzeViaSupabase(imageData: imageData, mimeType: mimeType)
    }
    
    // MARK: - Next.js API Implementation
    
    private func analyzeViaNextJS(imageData: Data, mimeType: String, url: URL) async throws -> AnalyzerObservation {
        var request = URLRequest(url: url.appendingPathComponent("/api/analyze-food"))
        request.httpMethod = "POST"
        request.timeoutInterval = configuration.timeout
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Next.js API expects JSON with imageBase64
        let payload = NextJSRequestPayload(imageBase64: imageData.base64EncodedString())
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (data, response) = try await urlSession.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            let status = (response as? HTTPURLResponse)?.statusCode ?? -1
            let body = String(data: data, encoding: .utf8) ?? "n/a"
            throw AnalyzerClientError.server(status: status, body: body)
        }
        
        // Try Next.js format first, then fallback to Supabase format
        do {
            let nextjsResponse = try JSONDecoder().decode(NextJSResponsePayload.self, from: data)
            let analyzerResponse = nextjsResponse.toAnalyzerResponse()
            NSLog("✅ [DualAnalyzer] Next.js API success! Used analyzers: \(analyzerResponse.meta?.used?.joined(separator: ", ") ?? "unknown")")
            return try parseResponse(analyzerResponse)
        } catch {
            // Fallback: try Supabase format (in case Next.js returns same format)
            NSLog("⚠️ [DualAnalyzer] Next.js format parse failed, trying Supabase format: \(error)")
            let decoded = try JSONDecoder().decode(AnalyzerResponsePayload.self, from: data)
            return try parseResponse(decoded)
        }
    }
    
    // MARK: - Supabase Edge Function Implementation
    
    private func analyzeViaSupabase(imageData: Data, mimeType: String) async throws -> AnalyzerObservation {
        var request = URLRequest(
            url: configuration.supabaseURL.appendingPathComponent("/analyze_food")
        )
        request.httpMethod = "POST"
        request.timeoutInterval = configuration.timeout
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(configuration.supabaseAPIKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(configuration.supabaseAPIKey)", forHTTPHeaderField: "Authorization")
        
        let payload = SupabaseRequestPayload(
            imageBase64: imageData.base64EncodedString(),
            mimeType: mimeType
        )
        request.httpBody = try JSONEncoder().encode(payload)
        
        let (data, response) = try await urlSession.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200..<300).contains(httpResponse.statusCode) else {
            let status = (response as? HTTPURLResponse)?.statusCode ?? -1
            let body = String(data: data, encoding: .utf8) ?? "n/a"
            throw AnalyzerClientError.server(status: status, body: body)
        }
        
        let decoded = try JSONDecoder().decode(AnalyzerResponsePayload.self, from: data)
        NSLog("✅ [DualAnalyzer] Supabase API success! Used analyzers: \(decoded.meta?.used?.joined(separator: ", ") ?? "unknown")")
        return try parseResponse(decoded)
    }
    
    // MARK: - Response Parsing
    
    private func parseResponse(_ decoded: AnalyzerResponsePayload) throws -> AnalyzerObservation {
        guard let firstItem = decoded.items.first else {
            throw AnalyzerClientError.decoding(
                NSError(domain: "DualAnalyzerClient", code: -1,
                       userInfo: [NSLocalizedDescriptionKey: "No items in response"])
            )
        }
        
        let priors: FoodPriors? = firstItem.priors.map { priorsData in
            FoodPriors(
                density: PriorStats(mu: priorsData.density.mu, sigma: priorsData.density.sigma),
                kcalPerG: PriorStats(mu: priorsData.kcalPerG.mu, sigma: priorsData.kcalPerG.sigma)
            )
        }
        
        let path: DetectionPath? = firstItem.path.flatMap { DetectionPath(rawValue: $0) }
        
        let nutritionLabel: NutritionLabel? = firstItem.nutritionLabel.map { labelData in
            NutritionLabel(
                servingSize: labelData.servingSize,
                caloriesPerServing: labelData.caloriesPerServing,
                totalServings: labelData.totalServings
            )
        }
        
        let menuItem: RestaurantMenuItem? = firstItem.menuItem.map { menuData in
            RestaurantMenuItem(
                restaurant: menuData.restaurant,
                itemName: menuData.itemName,
                calories: menuData.calories
            )
        }
        
        NSLog("✅ [DualAnalyzer] Parsed: Path=\(path?.rawValue ?? "nil"), Calories=\(firstItem.calories?.description ?? "nil")")
        
        return AnalyzerObservation(
            label: firstItem.label,
            confidence: firstItem.confidence,
            priors: priors,
            evidence: firstItem.evidence ?? [],
            metaUsed: decoded.meta?.used ?? [],
            path: path,
            calories: firstItem.calories,
            sigmaCalories: firstItem.sigmaCalories,
            nutritionLabel: nutritionLabel,
            menuItem: menuItem
        )
    }
}

// MARK: - Request Payloads

private struct NextJSRequestPayload: Encodable {
    let imageBase64: String
}

private struct SupabaseRequestPayload: Encodable {
    let imageBase64: String
    let mimeType: String
}

// MARK: - Next.js API Response Format

private struct NextJSResponsePayload: Decodable {
    let foodType: String
    let confidence: Double
    let calories: Double
    let weight: Double
    let emoji: String?
    let items: [NextJSItem]?
    let meta: NextJSMeta?
    
    struct NextJSItem: Decodable {
        let label: String
        let calories: Double
        let weight: Double
        let confidence: Double?
        let emoji: String?
    }
    
    struct NextJSMeta: Decodable {
        let used: [String]?
        let latencyMs: Double?
        let isFallback: Bool?
        let warnings: [String]?
        let calculationMethod: String?
        let itemCount: Int?
    }
    
    // Convert Next.js format to Supabase format for iOS compatibility
    func toAnalyzerResponse() -> AnalyzerResponsePayload {
        let items: [AnalyzerResponsePayload.Item]
        
        if let nextjsItems = self.items, !nextjsItems.isEmpty {
            // Multi-item meal response
            items = nextjsItems.map { item in
                AnalyzerResponsePayload.Item(
                    label: item.label,
                    confidence: item.confidence ?? self.confidence,
                    priors: nil, // Next.js API doesn't return priors in this format
                    evidence: [],
                    path: nil,
                    calories: item.calories,
                    sigmaCalories: item.calories * 0.1, // Estimate uncertainty
                    nutritionLabel: nil,
                    menuItem: nil
                )
            }
        } else {
            // Single item response
            items = [AnalyzerResponsePayload.Item(
                label: self.foodType,
                confidence: self.confidence,
                priors: nil, // Next.js API doesn't return priors in this format
                evidence: [],
                path: nil,
                calories: self.calories,
                sigmaCalories: self.calories * 0.1, // Estimate uncertainty
                nutritionLabel: nil,
                menuItem: nil
            )]
        }
        
        return AnalyzerResponsePayload(
            items: items,
            meta: AnalyzerResponsePayload.Meta(
                used: self.meta?.used,
                latencyMs: self.meta?.latencyMs
            )
        )
    }
}

// MARK: - Reuse Types from HTTPAnalyzerClient

// AnalyzerResponsePayload is defined in HTTPAnalyzerClient.swift and is accessible here
// We need to reference it, but since it's private in HTTPAnalyzerClient, we'll define it here too
// for DualAnalyzerClient's use

private struct AnalyzerResponsePayload: Decodable {
    struct Meta: Decodable {
        let used: [String]?
        let latencyMs: Double?
    }

    struct PriorsData: Decodable {
        struct StatData: Decodable {
            let mu: Double
            let sigma: Double
        }
        let density: StatData
        let kcalPerG: StatData
    }

    struct NutritionLabelData: Decodable {
        let servingSize: String
        let caloriesPerServing: Double
        let totalServings: Double?
    }

    struct MenuItemData: Decodable {
        let restaurant: String
        let itemName: String
        let calories: Double
    }

    struct Item: Decodable {
        let label: String
        let confidence: Double
        let priors: PriorsData?
        let evidence: [String]?
        let path: String?
        let calories: Double?
        let sigmaCalories: Double?
        let nutritionLabel: NutritionLabelData?
        let menuItem: MenuItemData?
    }

    let items: [Item]
    let meta: Meta?
}

