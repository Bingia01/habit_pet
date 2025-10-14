import Foundation
import CalorieCameraKit

/// Mock services for testing without camera or ML models
struct MockServices {

    /// Create mock food data for testing
    static func createMockFood(name: String = "Apple") -> EnrichedFoodData {
        return EnrichedFoodData(
            foodName: name,
            confidence: 0.9,
            weight: 100,
            calories: 52,
            macros: Macronutrients(
                protein: 0.3,
                carbs: 14.0,
                fat: 0.2,
                fiber: 2.4
            ),
            emoji: "🍎",
            source: .mlDetection,
            boundingBox: CGRect(x: 0, y: 0, width: 100, height: 100)
        )
    }

    /// Create a sample meal with multiple foods
    static func createSampleMeal() -> Meal {
        let foods = [
            EnrichedFoodData(
                foodName: "Grilled Chicken",
                confidence: 0.95,
                weight: 150,
                calories: 247,
                macros: Macronutrients(protein: 46.5, carbs: 0, fat: 5.4, fiber: 0),
                emoji: "🍗",
                source: .database,
                boundingBox: CGRect(x: 0, y: 0, width: 100, height: 100)
            ),
            EnrichedFoodData(
                foodName: "Brown Rice",
                confidence: 0.88,
                weight: 150,
                calories: 195,
                macros: Macronutrients(protein: 4.05, carbs: 42.0, fat: 0.45, fiber: 0.6),
                emoji: "🍚",
                source: .database,
                boundingBox: CGRect(x: 100, y: 0, width: 100, height: 100)
            ),
            EnrichedFoodData(
                foodName: "Broccoli",
                confidence: 0.92,
                weight: 100,
                calories: 34,
                macros: Macronutrients(protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6),
                emoji: "🥦",
                source: .database,
                boundingBox: CGRect(x: 200, y: 0, width: 100, height: 100)
            )
        ]

        return Meal(
            foods: foods,
            totalCalories: foods.reduce(0) { $0 + $1.calories },
            totalMacros: Macronutrients(
                protein: foods.reduce(0) { $0 + $1.macros.protein },
                carbs: foods.reduce(0) { $0 + $1.macros.carbs },
                fat: foods.reduce(0) { $0 + $1.macros.fat },
                fiber: foods.reduce(0) { $0 + $1.macros.fiber }
            ),
            timestamp: Date()
        )
    }

    /// Nutrition API mock responses
    static func mockAPIResponse() -> [NutritionInfo] {
        return [
            NutritionInfo(
                name: "Pizza Slice",
                servingSize: 100,
                calories: 266,
                macros: Macronutrients(protein: 11.0, carbs: 33.0, fat: 10.0, fiber: 2.0),
                emoji: "🍕"
            ),
            NutritionInfo(
                name: "Hamburger",
                servingSize: 100,
                calories: 295,
                macros: Macronutrients(protein: 17.0, carbs: 28.0, fat: 12.0, fiber: 1.5),
                emoji: "🍔"
            ),
            NutritionInfo(
                name: "Sushi",
                servingSize: 100,
                calories: 143,
                macros: Macronutrients(protein: 6.0, carbs: 23.0, fat: 3.5, fiber: 0.5),
                emoji: "🍣"
            )
        ]
    }
}

// MARK: - Mock Food Detector (for testing without camera)

class MockFoodDetector {
    static let shared = MockFoodDetector()

    private let sampleFoods = [
        ("Apple", "🍎", 52, 100.0),
        ("Banana", "🍌", 89, 120.0),
        ("Chicken Breast", "🍗", 165, 150.0),
        ("Salmon", "🐟", 208, 140.0),
        ("Broccoli", "🥦", 34, 100.0),
        ("Rice", "🍚", 130, 150.0)
    ]

    func getRandomFoodAnalysis() -> EnrichedFoodData {
        let random = sampleFoods.randomElement()!

        return EnrichedFoodData(
            foodName: random.0,
            confidence: Double.random(in: 0.75...0.95),
            weight: random.3,
            calories: random.2,
            macros: Macronutrients(
                protein: Double.random(in: 1...30),
                carbs: Double.random(in: 5...40),
                fat: Double.random(in: 0.5...15),
                fiber: Double.random(in: 0.5...5)
            ),
            emoji: random.1,
            source: .mlDetection,
            boundingBox: CGRect(x: 0, y: 0, width: 100, height: 100)
        )
    }
}
