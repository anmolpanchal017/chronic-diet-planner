import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

// USDA FoodData Central API — free, no auth required
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1'
// Demo API key from USDA (rate-limited but works without registration)
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY'

export interface USDANutrient {
  nutrientId: number
  nutrientName: string
  value: number
  unitName: string
}

export interface USDAFoodItem {
  fdcId: number
  description: string
  dataType: string
  foodNutrients: USDANutrient[]
}

// Nutrient IDs from USDA FoodData Central
const NUTRIENT_IDS = {
  calories: 1008,     // Energy (kcal)
  protein_g: 1003,    // Protein
  fat_g: 1004,        // Total lipid (fat)
  carbs_g: 1005,      // Carbohydrate, by difference
  fiber_g: 1079,      // Fiber, total dietary
  sodium_mg: 1093,    // Sodium, Na
  potassium_mg: 1092, // Potassium, K
  phosphorus_mg: 1091 // Phosphorus, P
}

function extractNutrients(foodNutrients: USDANutrient[]) {
  const result: Record<string, number> = {}
  for (const [key, id] of Object.entries(NUTRIENT_IDS)) {
    const nutrient = foodNutrients.find(n => n.nutrientId === id)
    result[key] = nutrient ? Math.round(nutrient.value * 10) / 10 : 0
  }
  return result
}

/**
 * GET /api/usda-lookup?query=<food+name>&pageSize=5
 * Live USDA FoodData Central API integration.
 * Used to fetch real nutritional data for Indian food items.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  const pageSize = Math.min(Number(searchParams.get('pageSize') || 5), 10)

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: 'query parameter is required (min 2 characters)' },
      { status: 400 }
    )
  }

  try {
    // Call USDA FoodData Central Search API
    const searchUrl = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&api_key=${USDA_API_KEY}&dataType=Foundation,SR%20Legacy`

    const response = await fetch(searchUrl, {
      headers: { 'Content-Type': 'application/json' },
      // 8-second timeout
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`USDA API returned status ${response.status}`)
    }

    const data = await response.json()

    const foods = (data.foods || []).map((food: any) => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      brandOwner: food.brandOwner || null,
      nutrition_per_100g: extractNutrients(food.foodNutrients || []),
    }))

    return NextResponse.json({
      query,
      totalHits: data.totalHits || 0,
      foods,
      source: 'USDA FoodData Central (fdc.nal.usda.gov)',
      note: 'Live API response — nutritional values are per 100g',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('USDA API error:', message)
    return NextResponse.json(
      {
        error: 'Failed to fetch from USDA FoodData Central',
        details: message,
        fallback_info: 'The app uses a local USDA CSV dataset as fallback when the live API is unavailable.',
      },
      { status: 502 }
    )
  }
}

/**
 * POST /api/usda-lookup
 * Fetch detailed nutrition for a specific FDC ID.
 */
export async function POST(request: NextRequest) {
  const { fdcId } = await request.json()

  if (!fdcId) {
    return NextResponse.json({ error: 'fdcId is required' }, { status: 400 })
  }

  try {
    const url = `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      throw new Error(`USDA API returned status ${response.status}`)
    }

    const food = await response.json()

    return NextResponse.json({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      nutrition_per_100g: extractNutrients(food.foodNutrients || []),
      source: 'USDA FoodData Central (fdc.nal.usda.gov)',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to fetch food details from USDA', details: message },
      { status: 502 }
    )
  }
}
