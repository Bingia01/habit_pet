import SwiftUI
import CalorieCameraKit

struct ContentView: View {
    @State private var showCamera = false
    @State private var capturedFoods: [EnrichedFoodData] = []
    @State private var showingAlert = false
    @State private var alertMessage = ""

    var body: some View {
        NavigationView {
            ZStack {
                // Background
                LinearGradient(
                    colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                VStack(spacing: 20) {
                    // Header
                    VStack(spacing: 8) {
                        Text("📸 Calorie Camera")
                            .font(.largeTitle)
                            .bold()

                        Text("Snap a photo to track your food")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 40)

                    // Stats Card
                    if !capturedFoods.isEmpty {
                        VStack(spacing: 16) {
                            Text("Today's Intake")
                                .font(.headline)

                            HStack(spacing: 30) {
                                StatView(
                                    label: "Total Calories",
                                    value: "\(totalCalories)",
                                    color: .orange
                                )

                                StatView(
                                    label: "Items",
                                    value: "\(capturedFoods.count)",
                                    color: .blue
                                )
                            }

                            // Macros
                            HStack(spacing: 12) {
                                MacroStatView(label: "Protein", value: totalProtein, color: .purple)
                                MacroStatView(label: "Carbs", value: totalCarbs, color: .green)
                                MacroStatView(label: "Fat", value: totalFat, color: .yellow)
                            }
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(20)
                        .shadow(radius: 5)
                        .padding(.horizontal)
                    }

                    // Food List
                    if !capturedFoods.isEmpty {
                        ScrollView {
                            VStack(spacing: 12) {
                                ForEach(capturedFoods) { food in
                                    FoodItemRow(food: food)
                                }
                            }
                            .padding(.horizontal)
                        }
                    } else {
                        Spacer()

                        VStack(spacing: 16) {
                            Image(systemName: "camera.circle.fill")
                                .font(.system(size: 80))
                                .foregroundColor(.gray)

                            Text("No food tracked yet")
                                .font(.title3)
                                .foregroundColor(.secondary)

                            Text("Tap the camera button to get started")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()
                    }

                    // Camera Button
                    Button(action: { showCamera = true }) {
                        HStack {
                            Image(systemName: "camera.fill")
                                .font(.title2)
                            Text("Capture Food")
                                .font(.headline)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: [Color.blue, Color.purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(15)
                        .shadow(radius: 5)
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 20)
                }
            }
            .navigationBarHidden(true)
            .fullScreenCover(isPresented: $showCamera) {
                CalorieCameraView(
                    onFoodCaptured: { food in
                        capturedFoods.append(food)
                        showCamera = false
                        alertMessage = "Added \(food.emoji) \(food.foodName) - \(food.calories) cal"
                        showingAlert = true
                    },
                    onDismiss: {
                        showCamera = false
                    }
                )
            }
            .alert("Food Captured!", isPresented: $showingAlert) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(alertMessage)
            }
        }
    }

    // MARK: - Computed Properties

    private var totalCalories: Int {
        capturedFoods.reduce(0) { $0 + $1.calories }
    }

    private var totalProtein: Double {
        capturedFoods.reduce(0) { $0 + $1.macros.protein }
    }

    private var totalCarbs: Double {
        capturedFoods.reduce(0) { $0 + $1.macros.carbs }
    }

    private var totalFat: Double {
        capturedFoods.reduce(0) { $0 + $1.macros.fat }
    }
}

// MARK: - Supporting Views

struct StatView: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Text(value)
                .font(.system(size: 32, weight: .bold))
                .foregroundColor(color)
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
        }
    }
}

struct MacroStatView: View {
    let label: String
    let value: Double
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            Text(String(format: "%.1fg", value))
                .font(.caption)
                .bold()
                .foregroundColor(color)
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
        .background(color.opacity(0.1))
        .cornerRadius(8)
    }
}

struct FoodItemRow: View {
    let food: EnrichedFoodData

    var body: some View {
        HStack(spacing: 12) {
            Text(food.emoji)
                .font(.system(size: 40))

            VStack(alignment: .leading, spacing: 4) {
                Text(food.foodName)
                    .font(.headline)

                HStack(spacing: 8) {
                    Text("\(food.calories) cal")
                        .font(.caption)
                        .foregroundColor(.orange)

                    Text("•")
                        .foregroundColor(.secondary)

                    Text("\(Int(food.weight))g")
                        .font(.caption)
                        .foregroundColor(.blue)

                    if food.confidence < 1.0 {
                        Text("•")
                            .foregroundColor(.secondary)

                        Text("\(Int(food.confidence * 100))%")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Spacer()

            // Macros preview
            VStack(alignment: .trailing, spacing: 2) {
                MacroLabel("P", value: food.macros.protein, color: .purple)
                MacroLabel("C", value: food.macros.carbs, color: .green)
                MacroLabel("F", value: food.macros.fat, color: .yellow)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(15)
        .shadow(radius: 2)
    }
}

struct MacroLabel: View {
    let label: String
    let value: Double
    let color: Color

    init(_ label: String, value: Double, color: Color) {
        self.label = label
        self.value = value
        self.color = color
    }

    var body: some View {
        HStack(spacing: 4) {
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
            Text(String(format: "%.1fg", value))
                .font(.caption2)
                .foregroundColor(color)
        }
    }
}

#Preview {
    ContentView()
}
