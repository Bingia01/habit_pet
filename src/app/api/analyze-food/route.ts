import { NextRequest, NextResponse } from 'next/server';

// Food recognition using Clarifai API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert image to base64
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    // Call Clarifai Food Recognition API with user_app_id
    const response = await fetch('https://api.clarifai.com/v2/models/food-item-recognition/outputs', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.CLARIFAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_app_id: {
          user_id: process.env.CLARIFAI_USER_ID || 'clarifai',
          app_id: process.env.CLARIFAI_APP_ID || 'main'
        },
        inputs: [{
          data: {
            image: { 
              base64: base64
            }
          }
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Clarifai API error:', response.status, errorText);
      throw new Error(`Clarifai API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Clarifai API response:', JSON.stringify(result, null, 2));
    
    // Process the results
    const concepts = result.outputs?.[0]?.data?.concepts || [];
    
    if (concepts.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No food items detected in the image'
      });
    }

    // Get the most confident food item
    const topFood = concepts[0];
    const foodName = topFood.name;
    const confidence = Math.round(topFood.value * 100);

    // Estimate calories based on food type
    const calories = estimateCalories(foodName);
    
    // Get portion size suggestions
    const portionSizes = getPortionSizes(foodName);

    return NextResponse.json({
      foodType: foodName,
      confidence: confidence / 100, // Convert to decimal (0-1)
      calories: calories,
      weight: estimateWeight(foodName), // Add weight estimation
      emoji: getFoodEmoji(foodName),
      portionSizes: portionSizes
    });

  } catch (error) {
    console.error('Food analysis error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to analyze food image' 
    }, { status: 500 });
  }
}

// Calorie estimation based on food type
function estimateCalories(foodName: string): number {
  const foodCalories: { [key: string]: number } = {
    // Fruits
    'apple': 95,
    'banana': 105,
    'orange': 62,
    'grape': 62,
    'strawberry': 4,
    'blueberry': 4,
    'avocado': 234,
    
    // Vegetables
    'broccoli': 55,
    'carrot': 25,
    'lettuce': 5,
    'tomato': 18,
    'cucumber': 16,
    'spinach': 7,
    'potato': 77,
    'sweet potato': 86,
    
    // Proteins
    'chicken': 165,
    'beef': 250,
    'fish': 206,
    'salmon': 206,
    'egg': 70,
    'tofu': 94,
    'cheese': 113,
    
    // Grains
    'rice': 130,
    'bread': 80,
    'pasta': 131,
    'quinoa': 120,
    'oats': 154,
    
    // Dairy
    'milk': 42,
    'yogurt': 59,
    'butter': 102,
    
    // Nuts
    'almond': 7,
    'walnut': 49,
    'peanut': 6,
    
    // Default
    'default': 100
  };

  const normalizedName = foodName.toLowerCase().trim();
  
  // Try exact match first
  if (foodCalories[normalizedName]) {
    return foodCalories[normalizedName];
  }
  
  // Try partial matches
  for (const [key, calories] of Object.entries(foodCalories)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return calories;
    }
  }
  
  return 100; // Default calories
}

// Weight estimation based on food type (in grams)
function estimateWeight(foodName: string): number {
  const foodWeights: { [key: string]: number } = {
    // Fruits
    'apple': 150,
    'banana': 120,
    'orange': 130,
    'grape': 100,
    'strawberry': 150,
    'blueberry': 100,
    'avocado': 200,
    
    // Vegetables
    'broccoli': 100,
    'carrot': 80,
    'lettuce': 50,
    'tomato': 120,
    'cucumber': 100,
    'spinach': 30,
    'potato': 150,
    'sweet potato': 130,
    
    // Proteins
    'chicken': 100,
    'beef': 100,
    'fish': 100,
    'salmon': 100,
    'egg': 50,
    'tofu': 100,
    'cheese': 30,
    
    // Grains
    'rice': 100,
    'bread': 30,
    'pasta': 100,
    'quinoa': 100,
    'oats': 40,
    
    // Dairy
    'milk': 250,
    'yogurt': 150,
    'butter': 15,
    
    // Nuts
    'almond': 10,
    'walnut': 10,
    'peanut': 10,
    
    // Default
    'default': 100
  };

  const normalizedName = foodName.toLowerCase().trim();
  
  // Try exact match first
  if (foodWeights[normalizedName]) {
    return foodWeights[normalizedName];
  }
  
  // Try partial matches
  for (const [key, weight] of Object.entries(foodWeights)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return weight;
    }
  }
  
  return 100; // Default weight in grams
}

// Portion size suggestions
function getPortionSizes(foodName: string): string[] {
  const portionMap: { [key: string]: string[] } = {
    'apple': ['Small (80 cal)', 'Medium (95 cal)', 'Large (116 cal)'],
    'banana': ['Small (90 cal)', 'Medium (105 cal)', 'Large (121 cal)'],
    'chicken': ['3oz (140 cal)', '4oz (185 cal)', '6oz (280 cal)'],
    'rice': ['1/2 cup (100 cal)', '1 cup (200 cal)', '1.5 cups (300 cal)'],
    'bread': ['1 slice (80 cal)', '2 slices (160 cal)'],
    'default': ['Small portion', 'Medium portion', 'Large portion']
  };

  const normalizedName = foodName.toLowerCase().trim();
  
  for (const [key, portions] of Object.entries(portionMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return portions;
    }
  }
  
  return portionMap.default;
}

// Get emoji for food
function getFoodEmoji(foodName: string): string {
  const emojiMap: { [key: string]: string } = {
    'apple': '🍎',
    'banana': '🍌',
    'orange': '🍊',
    'grape': '🍇',
    'strawberry': '🍓',
    'blueberry': '🫐',
    'avocado': '🥑',
    'broccoli': '🥦',
    'carrot': '🥕',
    'lettuce': '🥬',
    'tomato': '🍅',
    'cucumber': '🥒',
    'spinach': '🥬',
    'potato': '🥔',
    'sweet potato': '🍠',
    'chicken': '🍗',
    'beef': '🥩',
    'fish': '🐟',
    'salmon': '🐟',
    'egg': '🥚',
    'tofu': '🧈',
    'cheese': '🧀',
    'rice': '🍚',
    'bread': '🍞',
    'pasta': '🍝',
    'quinoa': '🌾',
    'oats': '🌾',
    'milk': '🥛',
    'yogurt': '🥛',
    'butter': '🧈',
    'almond': '🥜',
    'walnut': '🥜',
    'peanut': '🥜'
  };

  const normalizedName = foodName.toLowerCase().trim();
  
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return emoji;
    }
  }
  
  return '🍽️'; // Default food emoji
}
