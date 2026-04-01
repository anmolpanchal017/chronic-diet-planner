'use client'

import { useRouter } from 'next/navigation'
import { useAppState } from '@/components/AppStateProvider'
import Sidebar from '@/components/Sidebar'
import { Bell, Settings, TrendingUp, AlertCircle, CheckCircle2, Target } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'

export default function HealthScoresPage() {
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
  const completionHistory = state.mealCompletionHistory || []
  const plan = state.weekPlan

  // Calculate health metrics
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
        acc.sodium += Number(meal.nutrition.sodium_mg || 0)
        acc.potassium += Number(meal.nutrition.potassium_mg || 0)
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, potassium: 0 }
    )
  }

  // Condition-specific scores
  const conditionScores = profile.conditions?.map((condition) => {
    let score = 75 // Base score
    let metrics: any = {}

    switch (condition) {
      case 'DIABETES':
        score = 82
        metrics = {
          label: 'Diabetes Management',
          factors: [
            { name: 'Blood Sugar Control', value: 85, target: 100 },
            { name: 'Carb Management', value: 78, target: 100 },
            { name: 'GI Index Adherence', value: 91, target: 100 },
            { name: 'Consistency', value: 72, target: 100 },
          ],
        }
        break
      case 'HYPERTENSION':
        score = 79
        metrics = {
          label: 'Hypertension Control',
          factors: [
            { name: 'Sodium Reduction', value: 88, target: 100 },
            { name: 'Potassium Intake', value: 75, target: 100 },
            { name: 'Heart Health', value: 82, target: 100 },
            { name: 'Weight Management', value: 71, target: 100 },
          ],
        }
        break
      case 'CKD_STAGE_3':
      case 'CKD_STAGE_4':
        score = 76
        metrics = {
          label: 'Kidney Function',
          factors: [
            { name: 'Protein Control', value: 84, target: 100 },
            { name: 'Potassium Limit', value: 69, target: 100 },
            { name: 'Phosphorus Limit', value: 76, target: 100 },
            { name: 'Fluid Management', value: 81, target: 100 },
          ],
        }
        break
      case 'HEART_DISEASE':
        score = 81
        metrics = {
          label: 'Heart Health',
          factors: [
            { name: 'Sodium Restriction', value: 87, target: 100 },
            { name: 'Fat Management', value: 79, target: 100 },
            { name: 'Fiber Intake', value: 83, target: 100 },
            { name: 'Cholesterol Check', value: 75, target: 100 },
          ],
        }
        break
      case 'OBESITY':
        score = 74
        metrics = {
          label: 'Weight Management',
          factors: [
            { name: 'Caloric Intake', value: 72, target: 100 },
            { name: 'Protein Intake', value: 81, target: 100 },
            { name: 'Meal Consistency', value: 68, target: 100 },
            { name: 'Physical Activity', value: 73, target: 100 },
          ],
        }
        break
      case 'PCOD':
        score = 77
        metrics = {
          label: 'PCOD Management',
          factors: [
            { name: 'Insulin Sensitivity', value: 79, target: 100 },
            { name: 'Protein-Carb Balance', value: 76, target: 100 },
            { name: 'Regular Meals', value: 80, target: 100 },
            { name: 'GI Control', value: 72, target: 100 },
          ],
        }
        break
      default:
        break
    }

    return { condition, score, metrics }
  }) || []

  // Lab values trend data
  const labValuesTrend = [
    { week: 'Week 1', hbA1c: 8.2, bp_systolic: 145, eGFR: 55 },
    { week: 'Week 2', hbA1c: 8.1, bp_systolic: 142, eGFR: 56 },
    { week: 'Week 3', hbA1c: 7.9, bp_systolic: 138, eGFR: 57 },
    { week: 'Week 4', hbA1c: 7.7, bp_systolic: 135, eGFR: 58 },
  ]

  // Radar chart data for multi-condition compliance
  const complianceRadarData = conditionScores.slice(0, 4).map((item) => ({
    condition: item.condition.replace(/_/g, ' '),
    compliance: item.score,
    fullMark: 100,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900">
      <Sidebar />

      <div className="ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 border-b border-gray-200 backdrop-blur px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Health Scores</h1>
            <p className="text-sm text-gray-600 mt-1">Track your chronic condition metrics</p>
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
            {/* Condition Scores Overview */}
            <div>
              <h2 className="text-xl font-bold mb-6 text-gray-900">Condition-Specific Health Scores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {conditionScores.map((item) => (
                  <div
                    key={item.condition}
                    className="card p-6 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">{item.metrics.label}</h3>
                      {item.score >= 80 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : item.score >= 60 ? (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>

                    {/* Score Circle */}
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={item.score >= 80 ? '#10b981' : item.score >= 60 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="4"
                          strokeDasharray={`${(item.score / 100) * 282.74} 282.74`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{item.score}</div>
                          <div className="text-xs text-gray-600">/100</div>
                        </div>
                      </div>
                    </div>

                    {/* Sub-factors */}
                    <div className="space-y-2">
                      {item.metrics.factors.map((factor: any) => (
                        <div key={factor.name} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-700">{factor.name}</span>
                            <span className="font-semibold text-gray-900">{factor.value}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${factor.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Condition Compliance Radar */}
            {complianceRadarData.length > 0 && (
              <div className="card p-8">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Multi-Condition Compliance</h2>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={complianceRadarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="condition" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Radar
                      name="Health Score"
                      dataKey="compliance"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Tooltip formatter={(value) => `${Math.round(value as number)}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Lab Values Trend */}
            <div className="card p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Lab Values Progress</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">HbA1c & Blood Pressure</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={labValuesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis yAxisId="left" label={{ value: 'HbA1c (%)', angle: -90, position: 'insideLeft' }} />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Systolic BP (mmHg)', angle: 90, position: 'insideRight' }}
                      />
                      <Tooltip />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="hbA1c"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="HbA1c"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="bp_systolic"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="BP Systolic"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Kidney Function (eGFR)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={labValuesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis label={{ value: 'eGFR (mL/min)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="eGFR" fill="#10b981" name="eGFR" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Health Alerts */}
            <div>
              <h2 className="text-xl font-bold mb-6 text-gray-900">Health Alerts & Recommendations</h2>
              <div className="space-y-4">
                <div className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Great Progress on HbA1c</h4>
                      <p className="text-sm text-gray-700">Your HbA1c improved from 8.2% to 7.7% in 4 weeks. Keep maintaining your meal consistency.</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-l-yellow-500">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Monitor Sodium Intake</h4>
                      <p className="text-sm text-gray-700">Your potassium levels are slightly elevated. Reduce intake of potassium-rich foods and consult your doctor.</p>
                    </div>
                  </div>
                </div>

                <div className="card p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
                  <div className="flex items-start gap-4">
                    <TrendingUp className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Next Lab Test Due</h4>
                      <p className="text-sm text-gray-700">Schedule your next lab work in 2 weeks to track HbA1c, BP, and kidney function changes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Lab Values</h3>
                <div className="space-y-3">
                  {profile.labValues?.hbA1c && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700">HbA1c</span>
                      <span className="font-semibold text-gray-900">{profile.labValues.hbA1c.toFixed(1)}%</span>
                    </div>
                  )}
                  {profile.labValues?.bpSystolic && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700">Blood Pressure</span>
                      <span className="font-semibold text-gray-900">
                        {profile.labValues.bpSystolic}/{profile.labValues.bpDiastolic || 0} mmHg
                      </span>
                    </div>
                  )}
                  {profile.labValues?.eGFR && (
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-700">eGFR (Kidney Function)</span>
                      <span className="font-semibold text-gray-900">{profile.labValues.eGFR.toFixed(1)} mL/min</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-4">Last updated: Today</div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Health Goals</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Achieve HbA1c &lt; 7%</p>
                      <p className="text-xs text-gray-600">Current: 7.7% • Progress: 93%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">BP &lt; 130/80 mmHg</p>
                      <p className="text-xs text-gray-600">Current: 135/82 • Progress: 85%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Maintain eGFR &gt; 60</p>
                      <p className="text-xs text-gray-600">Current: 58 • Progress: 96%</p>
                    </div>
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
