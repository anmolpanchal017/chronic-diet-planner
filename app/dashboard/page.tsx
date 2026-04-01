'use client'

import { useRouter } from 'next/navigation'
import { useAppState } from '@/components/AppStateProvider'
import Sidebar from '@/components/Sidebar'
import VitalityScore from '@/components/VitalityScore'
import DailyProgress from '@/components/DailyProgress'
import AIInsight from '@/components/AIInsight'
import QuickActions from '@/components/QuickActions'
import TodaysMealPlan from '@/components/TodaysMealPlan'
import { Bell, Settings } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { state } = useAppState()

  if (!state.weekPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">No meal plan found. Please generate a plan first.</p>
      </div>
    )
  }

  const plan = state.weekPlan
  const profile = state.userProfile
  const completionHistory = state.mealCompletionHistory || []

  const getConsumedNutritionForDay = (dayIndex: number) => {
    const day = plan.days[dayIndex]
    const completedSet = new Set(
      completionHistory
        .filter(item => item.dayIndex === dayIndex && item.consumed)
        .map(item => `${item.dayIndex}-${item.mealIndex}`)
    )

    return (day.meals || []).reduce(
      (acc, meal, mealIndex) => {
        if (!completedSet.has(`${dayIndex}-${mealIndex}`)) return acc
        acc.calories += Number(meal.nutrition.calories || 0)
        acc.protein += Number(meal.nutrition.protein_g || 0)
        acc.carbs += Number(meal.nutrition.carbs_g || 0)
        acc.fat += Number(meal.nutrition.fat_g || 0)
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }

  const dayProgress = plan.days.map((day, idx) => {
    const consumed = getConsumedNutritionForDay(idx)
    const completedMeals = completionHistory.filter(item => item.dayIndex === idx && item.consumed).length
    const totalMeals = (day.meals || []).length
    return {
      idx,
      day,
      consumed,
      completedMeals,
      totalMeals,
      completionPct: totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0,
    }
  })

  const todayIndex = dayProgress.findIndex(d => d.completedMeals < d.totalMeals)
  const activeDayIndex = todayIndex === -1 ? Math.min(6, dayProgress.length - 1) : todayIndex
  const activeDay = dayProgress.length > 0 ? dayProgress[Math.max(0, activeDayIndex)] : null
  const streakDays = dayProgress.filter(d => d.completedMeals > 0).length
  const weeklyCompletion = dayProgress.length > 0
    ? dayProgress.reduce((sum, d) => sum + d.completionPct, 0) / dayProgress.length
    : 0

  // Calculate vitality score based on compliance
  const vitalityScore = Math.round(Math.min(100, weeklyCompletion * 1.2))

  // Get today's meals
  const todayMeals = activeDay?.day.meals?.slice(0, 3).map((meal) => ({
    id: meal.id,
    name: meal.name,
    type: (meal.type?.toUpperCase() || 'LUNCH') as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
    image_url: meal.image_url,
    prepTime: meal.prep_time_min || 20,
    calories: Math.round(meal.nutrition.calories),
    tags: meal.health_benefits?.slice(0, 2),
  })) || []

  // Daily Progress metrics
  const dailyProgressMetrics = [
    {
      label: 'Calories',
      value: Math.round(activeDay?.consumed.calories || 0),
      max: Math.round(activeDay?.day.total_nutrition.calories || 2000),
      unit: '',
      color: '#f59e0b',
    },
    {
      label: 'Protein',
      value: Math.round(activeDay?.consumed.protein || 0),
      max: Math.round(activeDay?.day.total_nutrition.protein_g || 100),
      unit: 'g',
      color: '#3b82f6',
    },
    {
      label: 'Carbs',
      value: Math.round(activeDay?.consumed.carbs || 0),
      max: Math.round(activeDay?.day.total_nutrition.carbs_g || 200),
      unit: 'g',
      color: '#10b981',
    },
    {
      label: 'Fats',
      value: Math.round(activeDay?.consumed.fat || 0),
      max: Math.round(activeDay?.day.total_nutrition.fat_g || 70),
      unit: 'g',
      color: '#ef4444',
    },
  ]

  const handleLogMeal = () => {
    router.push('/plan')
  }

  const handleViewFullWeek = () => {
    router.push('/plan')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-slate-900/50 border-b border-slate-700/50 backdrop-blur px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-slate-400 mt-1">Welcome back, {profile.fullName}!</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Vitality Score Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <VitalityScore score={vitalityScore} maxScore={100} />
              </div>

              {/* Right Column with Quick Stats */}
              <div className="lg:col-span-2 space-y-6">
                {/* Daily Progress Gauges */}
                <DailyProgress metrics={dailyProgressMetrics} />
              </div>
            </div>

            {/* AI Insight */}
            <AIInsight
              title="AI Insight"
              description="Your insulin sensitivity is peaking. This is the optimal window for your high-protein lunch to maximize muscle protein synthesis."
              recommendation="Eat your lunch within the next 2 hours"
            />

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Quick Actions</h3>
              <QuickActions
                onLogMeal={handleLogMeal}
                onAddActivity={() => alert('Coming soon!')}
                onUpdateHealth={() => alert('Coming soon!')}
              />
            </div>

            {/* Today's Meal Plan */}
            <TodaysMealPlan meals={todayMeals} onViewMore={handleViewFullWeek} />

            {/* Stats Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 mb-6">
              <div className="card p-6 bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Weekly Compliance</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{Math.round(weeklyCompletion)}%</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                    ✅
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-slate-800/80 border border-slate-700/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Streak Days</p>
                    <p className="text-3xl font-bold text-orange-400 mt-2">{streakDays} / 7</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">
                    🔥
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
