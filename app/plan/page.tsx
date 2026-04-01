'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/components/AppStateProvider'
import Sidebar from '@/components/Sidebar'
import { Bell, Settings, ChevronRight, ChevronDown } from 'lucide-react'

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function MealPlanPage() {
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({})

  if (!state.weekPlan) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">No meal plan found.</p>
            <button onClick={() => router.push('/onboarding')} className="btn btn-primary">
              Create Your First Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  const plan = state.weekPlan
  const profile = state.userProfile
  const completionHistory = state.mealCompletionHistory || []

  const toggleMealCompletion = (dayIndex: number, mealIndex: number) => {
    const key = `${dayIndex}-${mealIndex}`
    const isConsumed = completionHistory.some(
      (item) => item.dayIndex === dayIndex && item.mealIndex === mealIndex && item.consumed
    )
    dispatch({
      type: 'SET_MEAL_CONSUMED',
      payload: { dayIndex, mealIndex, consumed: !isConsumed },
    })
  }

  const toggleDetails = (e: React.MouseEvent, dayIndex: number, mealIndex: number) => {
    e.stopPropagation()
    const key = `${dayIndex}-${mealIndex}`
    setExpandedMeals(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900">
      <Sidebar />

      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 border-b border-gray-200 backdrop-blur px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your 7-Day Meal Plan</h1>
            <p className="text-sm text-gray-600 mt-1">Week of {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6 bg-white border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Total Days in Plan</p>
                <p className="text-4xl font-bold text-emerald-400 mt-2">7</p>
                <p className="text-xs text-gray-500 mt-2">Complete week coverage</p>
              </div>

              <div className="card p-6 bg-white border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Avg Daily Cost</p>
                <p className="text-4xl font-bold text-blue-400 mt-2">₹{Math.round(plan.week_summary.avg_daily_cost_inr)}</p>
                <p className="text-xs text-gray-500 mt-2">Within your budget</p>
              </div>

              <div className="card p-6 bg-white border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Nutrition Score</p>
                <p className="text-4xl font-bold text-purple-400 mt-2">{Math.round(plan.week_summary.nutrition_score)}/100</p>
                <p className="text-xs text-gray-500 mt-2">Excellent compliance</p>
              </div>

              <div className="card p-6 bg-white border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">Total Cost</p>
                <p className="text-4xl font-bold text-orange-400 mt-2">₹{Math.round(plan.week_summary.avg_daily_cost_inr * 7)}</p>
                <p className="text-xs text-gray-500 mt-2">For the week</p>
              </div>
            </div>

            {/* Weekly Meal Plan */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Menu</h2>
              <div className="space-y-6">
                {plan.days.map((day, dayIndex) => (
                  <div key={dayIndex} className="card overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-white">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold">{DAY_NAMES[dayIndex]}</h3>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm opacity-90">Daily Total</p>
                            <p className="text-2xl font-bold">{Math.round(day.total_nutrition.calories)} kcal</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm opacity-90">Cost</p>
                            <p className="text-2xl font-bold">₹{Math.round(day.total_cost_inr)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Meals */}
                    <div className="p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(day.meals || []).map((meal, mealIndex) => {
                          const mealKey = `${dayIndex}-${mealIndex}`
                          const isExpanded = !!expandedMeals[mealKey]
                          const isConsumed = completionHistory.some(
                            (item) =>
                              item.dayIndex === dayIndex &&
                              item.mealIndex === mealIndex &&
                              item.consumed
                          )

                          return (
                            <div
                              key={mealIndex}
                              className={`card p-6 border-2 transition-all cursor-pointer ${
                                isConsumed
                                  ? 'bg-emerald-900/30 border-emerald-500/50'
                                  : 'bg-white border-gray-200 hover:border-emerald-500/50'
                              }`}
                              onClick={() => toggleMealCompletion(dayIndex, mealIndex)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="badge badge-primary text-xs">
                                      {(meal.meal_type || 'lunch').toUpperCase()}
                                    </span>
                                    {isConsumed && (
                                      <span className="badge badge-success text-xs">✓ Consumed</span>
                                    )}
                                  </div>
                                  <h4 className="font-bold text-gray-900 text-lg">{meal.name}</h4>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={isConsumed}
                                  onChange={(e) => {
                                    e.stopPropagation()
                                    toggleMealCompletion(dayIndex, mealIndex)
                                  }}
                                  className="w-6 h-6 cursor-pointer accent-emerald-500"
                                />
                              </div>

                              {meal.image_url && (
                                <div className="w-full h-40 rounded-lg overflow-hidden mb-4 border border-gray-200">
                                  <img
                                    src={meal.image_url}
                                    alt={meal.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}

                              <p className="text-sm text-gray-700 mb-4">{meal.why_recommended}</p>

                              {/* Nutrition Card */}
                              <div className="grid grid-cols-2 gap-2 mb-4 p-4 bg-transparent rounded-lg">
                                <div>
                                  <p className="text-xs text-gray-600">Calories</p>
                                  <p className="font-semibold text-gray-900">{Math.round(meal.nutrition.calories)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Protein</p>
                                  <p className="font-semibold text-gray-900">{Math.round(meal.nutrition.protein_g)}g</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Carbs</p>
                                  <p className="font-semibold text-gray-900">{Math.round(meal.nutrition.carbs_g)}g</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600">Fat</p>
                                  <p className="font-semibold text-gray-900">{Math.round(meal.nutrition.fat_g)}g</p>
                                </div>
                              </div>

                              {/* Benefits */}
                              {meal.health_benefits && meal.health_benefits.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-gray-600 mb-2">Health Benefits:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {meal.health_benefits.slice(0, 3).map((benefit, idx) => (
                                      <span key={idx} className="badge badge-success text-xs">
                                        {benefit}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Cost & Time */}
                              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                  💰 ₹{meal.cost_inr || 0} • ⏱️ {meal.prep_time_min || 30}min
                                </div>
                                <button
                                  onClick={(e) => toggleDetails(e, dayIndex, mealIndex)}
                                  className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold flex items-center gap-1 transition-colors"
                                >
                                  {isExpanded ? 'Hide Details' : 'Details'} 
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              </div>

                              {/* Expanded Details Section */}
                              {isExpanded && (
                                <div
                                  className="mt-6 pt-6 border-t border-gray-200 animate-fade-in cursor-default"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Macro breakdown */}
                                  <div className="mb-4">
                                    <h5 className="font-semibold text-gray-800 mb-2 text-sm">Detailed Nutrition</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                      <div className="bg-slate-700/30 p-2 rounded border border-gray-300/30">
                                        <p className="text-xs text-gray-600">Sodium</p>
                                        <p className="font-medium text-gray-800">{Math.round(meal.nutrition.sodium_mg || 0)}mg</p>
                                      </div>
                                      <div className="bg-slate-700/30 p-2 rounded border border-gray-300/30">
                                        <p className="text-xs text-gray-600">Potassium</p>
                                        <p className="font-medium text-gray-800">{Math.round(meal.nutrition.potassium_mg || 0)}mg</p>
                                      </div>
                                      <div className="bg-slate-700/30 p-2 rounded border border-gray-300/30">
                                        <p className="text-xs text-gray-600">Phosphorus</p>
                                        <p className="font-medium text-gray-800">{Math.round(meal.nutrition.phosphorus_mg || 0)}mg</p>
                                      </div>
                                      <div className="bg-slate-700/30 p-2 rounded border border-gray-300/30">
                                        <p className="text-xs text-gray-600">Fiber</p>
                                        <p className="font-medium text-gray-800">{Math.round(meal.nutrition.fiber_g || 0)}g</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Ingredients list */}
                                  {meal.ingredients && meal.ingredients.length > 0 && (
                                    <div>
                                      <h5 className="font-semibold text-gray-800 mb-2 text-sm">Main Ingredients</h5>
                                      <ul className="space-y-1">
                                        {meal.ingredients.map((ing, idx) => (
                                          <li key={idx} className="flex justify-between text-xs items-center bg-white p-2 rounded border border-gray-200">
                                            <span className="text-gray-700">{ing.name}</span>
                                            <span className="text-gray-600 font-medium">{ing.quantity} {ing.unit}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center pt-8">
              <button onClick={() => router.push('/grocery')} className="btn btn-primary gap-2">
                View Grocery List <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => router.push('/dashboard')} className="btn btn-outline gap-2">
                Back to Dashboard <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


