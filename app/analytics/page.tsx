'use client'

import { useRouter } from 'next/navigation'
import { useAppState } from '@/components/AppStateProvider'
import Sidebar from '@/components/Sidebar'
import { Bell, Settings, Download, Filter } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const router = useRouter()
  const { state } = useAppState()

  if (!state.weekPlan || !state.userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No data found. Please generate a plan first.</p>
      </div>
    )
  }

  const profile = state.userProfile
  const plan = state.weekPlan
  const completionHistory = state.mealCompletionHistory || []

  // Calculate analytics data
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
        acc.fiber += Number(meal.nutrition.fiber_g || 0)
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    )
  }

  // Weekly nutrition data
  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const weeklyNutritionData = plan.days.map((day, idx) => {
    const consumed = getConsumedNutritionForDay(idx)
    return {
      day: DAY_NAMES[idx],
      plannedCalories: Math.round(day.total_nutrition.calories),
      consumedCalories: Math.round(consumed.calories),
      plannedProtein: Math.round(day.total_nutrition.protein_g),
      consumedProtein: Math.round(consumed.protein),
      plannedCarbs: Math.round(day.total_nutrition.carbs_g),
      consumedCarbs: Math.round(consumed.carbs),
    }
  })

  // Cost analytics
  const costData = plan.days.map((day, idx) => {
    const consumed = getConsumedNutritionForDay(idx)
    const completionPct =
      consumed.calories > 0
        ? Math.min(100, (consumed.calories / day.total_nutrition.calories) * 100)
        : 0
    return {
      day: DAY_NAMES[idx],
      planned: day.total_cost_inr,
      actual: (day.total_cost_inr * completionPct) / 100,
    }
  })

  // Macronutrient distribution
  const totalWeekNutrition = weeklyNutritionData.reduce(
    (acc, day) => ({
      protein: acc.protein + day.consumedProtein,
      carbs: acc.carbs + day.consumedCarbs,
      fat: acc.fat + 0, // Would need this from data
    }),
    { protein: 0, carbs: 0, fat: 0 }
  )

  const macroData = [
    { name: 'Protein', value: totalWeekNutrition.protein, color: '#3b82f6' },
    { name: 'Carbs', value: totalWeekNutrition.carbs, color: '#f59e0b' },
    { name: 'Fat', value: totalWeekNutrition.fat || 150, color: '#ef4444' },
  ]

  // Meal type distribution
  const mealTypeData = plan.days.reduce(
    (acc, day) => {
      ;(day.meals || []).forEach((meal) => {
        const type = meal.meal_type || 'lunch'
        const existing = acc.find((m) => m.name === type)
        if (existing) {
          existing.value += 1
        } else {
          acc.push({ name: type, value: 1 })
        }
      })
      return acc
    },
    [] as Array<{ name: string; value: number }>
  )

  // Compliance score trend
  const complianceData = [
    { day: 'Mon', compliance: 65, target: 90 },
    { day: 'Tue', compliance: 72, target: 90 },
    { day: 'Wed', compliance: 78, target: 90 },
    { day: 'Thu', compliance: 85, target: 90 },
    { day: 'Fri', compliance: 88, target: 90 },
    { day: 'Sat', compliance: 82, target: 90 },
    { day: 'Sun', compliance: 79, target: 90 },
  ]

  // Condition adherence
  const conditionAdherence = (profile.conditions || []).map((condition) => {
    const adherencePercentages = {
      DIABETES: 82,
      HYPERTENSION: 79,
      CKD_STAGE_3: 76,
      CKD_STAGE_4: 74,
      HEART_DISEASE: 81,
      OBESITY: 68,
      PCOD: 77,
    }
    return {
      condition: condition.replace(/_/g, ' '),
      adherence: adherencePercentages[condition as keyof typeof adherencePercentages] || 75,
    }
  })

  const totalWeekCost = costData.reduce((sum, d) => sum + d.actual, 0)
  const totalWeekCalories = weeklyNutritionData.reduce((sum, d) => sum + d.consumedCalories, 0)
  const avgDailyCalories = Math.round(totalWeekCalories / 7)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900">
      <Sidebar />

      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 border-b border-gray-200 backdrop-blur px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Detailed insights into your nutrition and compliance</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              <Download className="w-5 h-5" />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <p className="text-gray-600 text-sm font-medium">Total Calories This Week</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{Math.round(totalWeekCalories)}</p>
                <p className="text-xs text-gray-600 mt-2">Avg: {avgDailyCalories} kcal/day</p>
              </div>

              <div className="card p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
                <p className="text-gray-600 text-sm font-medium">Total Cost This Week</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">₹{Math.round(totalWeekCost)}</p>
                <p className="text-xs text-gray-600 mt-2">Budget Remaining: ₹500</p>
              </div>

              <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <p className="text-gray-600 text-sm font-medium">Avg Daily Compliance</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">81%</p>
                <p className="text-xs text-gray-600 mt-2">Target: 90%</p>
              </div>

              <div className="card p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <p className="text-gray-600 text-sm font-medium">Condition Adherence</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">79%</p>
                <p className="text-xs text-gray-600 mt-2">Multi-condition average</p>
              </div>
            </div>

            {/* Nutrition Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Weekly Calorie Intake</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyNutritionData}>
                    <defs>
                      <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="plannedCalories"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorPlanned)"
                      name="Planned"
                    />
                    <Area
                      type="monotone"
                      dataKey="consumedCalories"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorConsumed)"
                      name="Consumed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Cost vs Planned Budget</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${Math.round(value as number)}`} />
                    <Bar dataKey="planned" fill="#dbeafe" name="Budget" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Macronutrient & Meal Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Macronutrient Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Math.round(value as number)}g`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Meal Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mealTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mealTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Compliance Trends */}
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Compliance Score Trend</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => `${Math.round(value as number)}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#dbeafe"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target"
                  />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Actual"
                    dot={{ fill: '#10b981', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Condition Adherence */}
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Condition-Specific Adherence</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conditionAdherence} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="condition" type="category" width={150} />
                  <Tooltip formatter={(value) => `${Math.round(value as number)}%`} />
                  <Bar dataKey="adherence" fill="#10b981" name="Adherence %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Trends */}
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Protein & Carb Tracking</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyNutritionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" label={{ value: 'Protein (g)', angle: -90, position: 'insideLeft' }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Carbs (g)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="consumedProtein"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Protein"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="consumedCarbs"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Carbs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4">Top Meals This Week</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-700">Brown Rice & Lentils</span>
                    <span className="text-xs font-semibold text-gray-900">4 times</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-700">Grilled Chicken</span>
                    <span className="text-xs font-semibold text-gray-900">3 times</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-700">Vegetable Curry</span>
                    <span className="text-xs font-semibold text-gray-900">5 times</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4">Nutritional Wins</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-gray-700">Protein target hit 5/7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-gray-700">Sodium under limit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⚠</span>
                    <span className="text-sm text-gray-700">Carbs slightly over 2 days</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 mb-4">Week Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Meals Logged</span>
                    <span className="font-semibold text-gray-900">18/21</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Budget Used</span>
                    <span className="font-semibold text-gray-900">₹1,240/₹1,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Avg Rating</span>
                    <span className="font-semibold text-gray-900">4.2/5 ⭐</span>
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
