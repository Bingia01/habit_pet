//
//  ContentView.swift
//  CalorieCameraHost
//
//  Created by Wutthichai Upatising on 10/14/25.
//

import SwiftUI
import CalorieCameraKit

struct CameraHostRootView: View {
    @State private var isCameraPresented = false
    @State private var lastResult: CalorieResult?

    init() {
        // Debug: Check environment variables
        let env = ProcessInfo.processInfo.environment
        print("🔍 ENV CHECK - ANALYZER_BASE_URL: \(env["ANALYZER_BASE_URL"] ?? "NOT SET")")
        print("🔍 ENV CHECK - SUPABASE_ANON_KEY exists: \(env["SUPABASE_ANON_KEY"] != nil)")
    }

    var body: some View {
        VStack(spacing: 24) {
            if let result = lastResult {
                Text("Last capture: \(Int(result.total.mu)) kcal ± \(Int(2 * result.total.sigma))")
                    .font(.headline)
                    .multilineTextAlignment(.center)

                if let evidence = result.items.first?.evidence {
                    Text("Evidence: \(evidence.joined(separator: ", "))")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
            } else {
                Text("No captures yet")
                    .foregroundColor(.secondary)
            }

            Button("Open Calorie Camera") {
                isCameraPresented = true
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
        .fullScreenCover(isPresented: $isCameraPresented) {
            CalorieCameraView(
                config: .development,  // Use development config with routerEnabled: true
                onResult: { result in
                    lastResult = result
                    isCameraPresented = false
                },
                onCancel: {
                    isCameraPresented = false
                }
            )
        }
    }
}

