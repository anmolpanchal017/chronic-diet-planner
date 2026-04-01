'use client'

import React from 'react'
import { Clock, Flame } from 'lucide-react'

interface MealInfo {
  id: string
  name: string
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'
  image_url?: string
  prepTime: number
  calories: number
  tags?: string[]
}

interface TodayMealCardProps {
  meal: MealInfo
  onSwap?: () => void
  onView?: () => void
}

const mealTypeIcons = {
  BREAKFAST: '🍳',
  LUNCH: '🍲',
  DINNER: '🐟',
  SNACK: '🥗',
}

const mealTypeLabels = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack',
}

export function TodayMealCard({ meal, onSwap, onView }: TodayMealCardProps) {
  return (
    <div className="card overflow-hidden hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer bg-white border border-gray-200">
      {/* Image Container */}
      <div className="relative h-40 bg-slate-700 overflow-hidden">
        {meal.image_url ? (
          <img
            src={meal.image_url}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-50">
            {mealTypeIcons[meal.type]}
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-gray-100/90 transition-all duration-300" />

        {/* Meal Type Badge */}
        <div className="absolute top-3 left-3 bg-white/90 border border-gray-300 px-3 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-md">
          {mealTypeLabels[meal.type]}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-400 transition-colors">{meal.name}</h4>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{meal.prepTime}min</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>{meal.calories}kcal</span>
          </div>
        </div>

        {/* Tags */}
        {meal.tags && meal.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {meal.tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            onClick={onView}
            className="flex-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 py-2 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={onSwap}
            className="flex-1 text-sm font-medium text-blue-400 hover:text-blue-300 py-2 transition-colors"
          >
            🔄 Swap
          </button>
        </div>
      </div>
    </div>
  )
}

interface TodaysMealPlanProps {
  meals: MealInfo[]
  onViewMore?: () => void
  onViewMeal?: (mealId: string) => void
  onSwapMeal?: (mealId: string) => void
}

export default function TodaysMealPlan({ meals, onViewMore, onViewMeal, onSwapMeal }: TodaysMealPlanProps) {
  return (
    <div className="card p-8 bg-white border border-gray-200">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Today's Meal Plan</h3>
          <p className="text-gray-600 mt-1">Curated clinical nutrition for your metabolic type</p>
        </div>
        <button
          onClick={onViewMore}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-2 transition-colors"
        >
          View Full Week →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <TodayMealCard 
            key={meal.id} 
            meal={meal} 
            onView={onViewMeal ? () => onViewMeal(meal.id) : onViewMore}
            onSwap={onSwapMeal ? () => onSwapMeal(meal.id) : onViewMore}
          />
        ))}
      </div>
    </div>
  )
}
