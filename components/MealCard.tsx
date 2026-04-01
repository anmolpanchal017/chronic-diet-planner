'use client'

import { Meal } from '@/lib/types'
import { ChevronDown, Check, AlertCircle, X, Leaf, Zap } from 'lucide-react'
import Image from 'next/image'

interface MealCardProps {
  meal: Meal
  isExpanded: boolean
  isConsumed?: boolean
  onToggleExpand: () => void
  onSwap: () => void
  onToggleConsumed?: (consumed: boolean) => void
}

const getNutrientColor = (value: number, min: number, max: number) => {
  if (value < min) return 'bg-blue-500/30 text-blue-200 border border-blue-500/50'
  if (value > max * 1.1) return 'bg-red-500/30 text-red-200 border border-red-500/50'
  if (value > max) return 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
  return 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
}

export default function MealCard({ meal, isExpanded, isConsumed = false, onToggleExpand, onSwap, onToggleConsumed }: MealCardProps) {
  const getStatusIcon = () => {
    switch (meal.validation.status) {
      case 'pass':
        return <Check className="w-4 h-4 text-emerald-400" />
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-amber-400" />
      case 'fail':
        return <X className="w-4 h-4 text-red-400" />
    }
  }

  return (
    <div className={`card divide-y divide-slate-700 bg-slate-800/80 border border-slate-700/80 ${isConsumed ? 'ring-2 ring-emerald-500/60 bg-slate-800/90' : ''}`}>
      {/* Header */}
      <div
        onClick={onToggleExpand}
        className="p-4 cursor-pointer hover:bg-slate-700/50 transition"
      >
        <div className="flex items-start gap-4">
          {/* Image */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
            <Image
              src={meal.unsplash_image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'}
              alt={meal.dish_name}
              fill
              className="object-cover"
            />
          </div>

          {/* Main Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`text-lg font-bold ${isConsumed ? 'line-through text-slate-500' : 'text-white'}`}>{meal.dish_name}</h3>
              <div className={`badge font-medium text-xs px-3 py-1 rounded-lg ${meal.meal_type === 'breakfast' ? 'bg-amber-500/40 text-amber-100 border border-amber-500/60' : meal.meal_type === 'snack' ? 'bg-pink-500/40 text-pink-100 border border-pink-500/60' : 'bg-emerald-500/40 text-emerald-100 border border-emerald-500/60'}`}>
                {meal.meal_type.charAt(0).toUpperCase() + meal.meal_type.slice(1)}
              </div>
            </div>

            <label
              className="inline-flex items-center gap-2 mb-2 text-sm text-slate-300"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isConsumed}
                onChange={(e) => onToggleConsumed?.(e.target.checked)}
                className="accent-emerald-500"
              />
              {isConsumed ? 'Patient consumed this meal' : 'Mark as consumed'}
            </label>

            {meal.is_highly_recommended && (
              <div className="badge bg-emerald-500/40 text-emerald-100 border border-emerald-500/60 mb-2 gap-1 font-medium px-3 py-1 rounded-lg text-xs">
                <Zap className="w-3 h-3" /> Highly Recommended
              </div>
            )}

            <p className="text-sm text-slate-300 mb-2">{meal.clinical_reason}</p>

            {/* Quick Stats */}
            <div className="flex gap-2 flex-wrap text-xs">
              <span className="badge bg-amber-500/40 text-amber-100 border border-amber-500/60 px-2 py-1 rounded font-medium">{Math.round(meal.nutrition.calories)} cal</span>
              <span className="badge bg-blue-500/40 text-blue-100 border border-blue-500/60 px-2 py-1 rounded font-medium">{meal.nutrition.carbs_g}g carbs</span>
              <span className="badge bg-pink-500/40 text-pink-100 border border-pink-500/60 px-2 py-1 rounded font-medium">{meal.nutrition.protein_g}g protein</span>
              <span className="badge bg-teal-500/40 text-teal-100 border border-teal-500/60 px-2 py-1 rounded font-medium">₹{meal.cost_inr}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">{getStatusIcon()} <ChevronDown className={`w-4 h-4 transition ${isExpanded ? 'rotate-180' : ''}`} /></div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Why Recommended */}
          <div className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <p className="text-sm font-medium text-blue-200">{meal.why_recommended}</p>
          </div>

          {/* Health Benefits */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-slate-200">Health Benefits</h4>
            <ul className="space-y-1">
              {meal.health_benefits.map((benefit, idx) => (
                <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                  <Leaf className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Nutrition Details */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-slate-200">Nutrition Per Serving</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-slate-700/60 border border-slate-600/60 rounded text-center">
                <p className="font-medium text-white">{Math.round(meal.nutrition.calories)}</p>
                <p className="text-slate-400">Calories</p>
              </div>
              <div className="p-2 bg-slate-700/60 border border-slate-600/60 rounded text-center">
                <p className="font-medium text-white">{meal.nutrition.protein_g}g</p>
                <p className="text-slate-400">Protein</p>
              </div>
              <div className="p-2 bg-slate-700/60 border border-slate-600/60 rounded text-center">
                <p className="font-medium text-white">{meal.nutrition.fat_g}g</p>
                <p className="text-slate-400">Fat</p>
              </div>
              <div className="p-2 bg-slate-700/60 border border-slate-600/60 rounded text-center">
                <p className="font-medium text-white">{meal.nutrition.carbs_g}g</p>
                <p className="text-slate-400">Carbs</p>
              </div>
              <div className="p-2 bg-slate-700/60 border border-slate-600/60 rounded text-center">
                <p className="font-medium text-white">{meal.nutrition.fiber_g}g</p>
                <p className="text-slate-400">Fiber</p>
              </div>
              <div className="p-2 bg-slate-700/60 border border-slate-600/60 rounded text-center">
                <p className="font-medium text-white">{meal.gi_index}</p>
                <p className="text-slate-400">GI Index</p>
              </div>
            </div>
          </div>

          {/* Critical Nutrients */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-slate-200">Critical Nutrients (CKD/HTN Safe)</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded text-center font-medium ${getNutrientColor(meal.nutrition.sodium_mg, 0, 400)}`}>
                <p>{meal.nutrition.sodium_mg}mg</p>
                <p className="mt-1">Sodium</p>
              </div>
              <div className={`p-2 rounded text-center font-medium ${getNutrientColor(meal.nutrition.potassium_mg, 0, 250)}`}>
                <p>{meal.nutrition.potassium_mg}mg</p>
                <p className="mt-1">Potassium</p>
              </div>
              <div className={`p-2 rounded text-center font-medium ${getNutrientColor(meal.nutrition.phosphorus_mg, 0, 150)}`}>
                <p>{meal.nutrition.phosphorus_mg}mg</p>
                <p className="mt-1">Phosphorus</p>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-slate-200">Ingredients</h4>
            <ul className="text-xs text-slate-300 space-y-1">
              {meal.ingredients.map((ing, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{ing.name}</span>
                  <span className="text-slate-500">
                    {ing.quantity} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prep Time */}
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>⏱️ Prep Time: {meal.prep_time_min} min</span>
            <span>💰 Cost: ₹{meal.cost_inr}</span>
          </div>

          {/* Swap Button */}
          <button onClick={onSwap} className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-medium w-full transition-all duration-200 shadow-lg shadow-teal-500/20">
            🔄 Swap This Meal
          </button>
        </div>
      )}
    </div>
  )
}
