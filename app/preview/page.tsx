'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { useAppState } from '@/components/AppStateProvider'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function PreviewPage() {
  const { state, dispatch } = useAppState()
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showOptimizeModal, setShowOptimizeModal] = useState(false)
  const [isPriceOptimized, setIsPriceOptimized] = useState(false)
  const [optimizedDailyCost, setOptimizedDailyCost] = useState<number | null>(null)
  const [baseDailyCost, setBaseDailyCost] = useState<number>(0)
  const [baseWeeklyCost, setBaseWeeklyCost] = useState<number>(0)
  const [baseYearlyCost, setBaseYearlyCost] = useState<number>(0)
  const [isCostLoading, setIsCostLoading] = useState(false)

  if (!state.resolvedEnvelope) {
    return <div className="text-center py-12">Loading...</div>
  }

  const profile = state.userProfile
  const daily_cost = baseDailyCost
  const effectiveDailyCost = optimizedDailyCost ?? daily_cost
  const weekly_cost = optimizedDailyCost ? optimizedDailyCost * 7 : baseWeeklyCost
  const yearly_cost = optimizedDailyCost ? (optimizedDailyCost * 7 * 52) : baseYearlyCost
  const dailySavings = Math.max(0, daily_cost - effectiveDailyCost)
  const weeklySavings = Math.max(0, baseWeeklyCost - weekly_cost)

  const costData = [
    { name: 'Breakfast', value: effectiveDailyCost * 0.25 },
    { name: 'Lunch', value: effectiveDailyCost * 0.35 },
    { name: 'Dinner', value: effectiveDailyCost * 0.3 },
    { name: 'Snacks', value: effectiveDailyCost * 0.1 },
  ]

  useEffect(() => {
    const fetchCostPreview = async () => {
      setIsCostLoading(true)
      try {
        const response = await fetch('/api/cost-preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userProfile: profile }),
        })
        const result = await response.json()
        if (!response.ok || !result?.data) {
          throw new Error(result?.error || 'Failed to load cost preview')
        }

        setBaseDailyCost(Number(result.data.averageDailyCost || 0))
        setBaseWeeklyCost(Number(result.data.weeklyCost || 0))
        setBaseYearlyCost(Number(result.data.yearlyCost || 0))
        setOptimizedDailyCost(null)
        setIsPriceOptimized(false)
      } catch (error) {
        console.error('Cost preview error:', error)
        setBaseDailyCost(0)
        setBaseWeeklyCost(0)
        setBaseYearlyCost(0)
      } finally {
        setIsCostLoading(false)
      }
    }

    fetchCostPreview()
  }, [
    profile.conditions,
    profile.allergens,
    profile.dietType,
    profile.region,
    profile.mealsPerDay,
    profile.familyMembersCount,
    profile.labValues,
  ])

  const handleOpenOptimizeWarning = () => {
    setShowOptimizeModal(true)
  }

  const handleConfirmOptimize = () => {
    const reducedDailyCost = Math.max(1, Math.round(daily_cost * 0.85))
    setOptimizedDailyCost(reducedDailyCost)
    setIsPriceOptimized(true)
    setShowOptimizeModal(false)
  }

  const handleGeneratePlan = async () => {
    setIsGenerating(true)
    dispatch({ type: 'SET_GENERATING', payload: true })

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile: state.userProfile }),
      })

      if (!response.ok) throw new Error('Failed to generate plan')

      const reader = response.body?.getReader()
      let pending = ''
      let completed = false

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          pending += new TextDecoder().decode(value, { stream: true })
          const frames = pending.split('\n\n')
          pending = frames.pop() || ''

          for (const frame of frames) {
            const lines = frame.split('\n')
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              try {
                const data = JSON.parse(line.slice(6))
                if (data.error) {
                  throw new Error(data.error)
                }
                if (data.complete && data.data) {
                  if (!Array.isArray(data.data.days) || data.data.days.length === 0) {
                    throw new Error('Generated plan is incomplete. Please try again.')
                  }
                  dispatch({ type: 'SET_WEEK_PLAN', payload: data.data })
                  completed = true
                  router.push('/plan')
                  return
                }
              } catch (e) {
                if (e instanceof Error) {
                  throw e
                }
              }
            }
          }
        }
      }

      if (!completed) {
        throw new Error('Plan generation did not finish. Please try again.')
      }
    } catch (error) {
      console.error('Error generating plan:', error)
      const message = error instanceof Error ? error.message : 'Failed to generate meal plan'
      dispatch({ type: 'SET_ERROR', payload: message })
    } finally {
      setIsGenerating(false)
      dispatch({ type: 'SET_GENERATING', payload: false })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Budget Preview</h1>

        {/* Budget Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Estimated Daily Cost</p>
            {isPriceOptimized && (
              <p className="text-sm text-gray-500 line-through">₹{daily_cost.toLocaleString('en-IN')}</p>
            )}
            <p className="text-3xl font-bold text-emerald-400">₹{effectiveDailyCost.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-600 mt-2">
              From CSV dishes + PDF/user profile conditions
            </p>
          </div>

          <div className="card p-6 bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Weekly Total Cost</p>
            <p className="text-3xl font-bold text-teal-400">₹{weekly_cost.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-600 mt-2">7 days × ₹{effectiveDailyCost}</p>
          </div>

          <div className="card p-6 bg-white border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Yearly Cost Projection</p>
            <p className="text-3xl font-bold text-purple-400">₹{yearly_cost.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-500 mt-2">52 weeks based on CSV-driven weekly cost</p>
          </div>
        </div>

        {isCostLoading && (
          <div className="card p-3 mb-8 text-sm text-gray-600 bg-white border border-gray-200">Calculating cost from CSV data and your medical profile...</div>
        )}

        {isPriceOptimized && (
          <div className="card p-4 mb-8 bg-emerald-900/30 border border-emerald-500/50">
            <p className="text-sm font-semibold text-emerald-400">Price optimized successfully</p>
            <p className="text-sm text-emerald-500/80 mt-1">
              Daily savings: ₹{dailySavings.toLocaleString('en-IN')} | Weekly savings: ₹{weeklySavings.toLocaleString('en-IN')}
            </p>
          </div>
        )}

        {/* Cost Breakdown Chart */}
        <div className="card p-6 mb-8 bg-white border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Daily Cost Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#475569" />
              <YAxis stroke="#475569" />
              <Tooltip formatter={value => `₹${Number(value).toFixed(0)}`} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
              <Bar dataKey="value" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PDF-Based Priorities */}
        <div className="card p-6 mb-8 bg-white border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">PDF-Based Nutrient & Food Priorities</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-medium text-gray-800 mb-2">Target Nutrients</p>
              <div className="space-y-1 text-gray-600">
                <p>Calories: {state.resolvedEnvelope.calories[0]} - {state.resolvedEnvelope.calories[1]} kcal</p>
                <p>Protein: {state.resolvedEnvelope.protein_g[0].toFixed(0)} - {state.resolvedEnvelope.protein_g[1].toFixed(0)} g</p>
                <p>Carbs: {state.resolvedEnvelope.carbs_g[0]} - {state.resolvedEnvelope.carbs_g[1]} g</p>
                <p>Sodium max: {state.resolvedEnvelope.sodium_mg[1]} mg</p>
                <p>Potassium max: {state.resolvedEnvelope.potassium_mg[1]} mg</p>
                <p>Phosphorus max: {state.resolvedEnvelope.phosphorus_mg[1]} mg</p>
              </div>
            </div>
            <div>
              <p className="font-medium text-gray-800 mb-2">Food Focus from PDF Conditions</p>
              <div className="space-y-1 text-gray-600">
                {(profile.conditions || []).length > 0 ? (
                  (profile.conditions || []).map((condition) => (
                    <p key={condition}>
                      • {condition}: suggestions will be selected from uploaded CSV dishes that satisfy resolved nutrient limits.
                    </p>
                  ))
                ) : (
                  <p>• Upload PDF or select condition for data-driven daily suggestions.</p>
                )}
                {profile.labValues?.hbA1c && <p>• HbA1c priority: {profile.labValues.hbA1c}%</p>}
                {(profile.labValues?.bpSystolic || profile.labValues?.bpDiastolic) && (
                  <p>• Blood pressure priority: {profile.labValues?.bpSystolic || '?'} / {profile.labValues?.bpDiastolic || '?'} mmHg</p>
                )}
                {profile.labValues?.eGFR && <p>• Kidney function priority (eGFR): {profile.labValues.eGFR} mL/min</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Profie Summary */}
        <div className="card p-6 mb-8 bg-white border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Profile Summary</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{profile.fullName}</p>
            </div>
            <div>
              <p className="text-gray-600">Conditions</p>
              <p className="font-medium text-gray-900">{profile.conditions?.join(', ')}</p>
            </div>
            <div>
              <p className="text-gray-600">Diet Type</p>
              <p className="font-medium text-gray-900">{profile.dietType}</p>
            </div>
            <div>
              <p className="text-gray-600">Region</p>
              <p className="font-medium text-gray-900">{profile.region}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button onClick={handleOpenOptimizeWarning} className="btn btn-outline text-gray-700 border-gray-300 hover:bg-gray-200 gap-2">
            Optimize Price
          </button>
          <button onClick={handleGeneratePlan} disabled={isGenerating} className="btn btn-primary gap-2 flex-1 relative overflow-hidden group">
            {isGenerating ? 'Generating Plan...' : 'Yes, create my plan!'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {showOptimizeModal && (
          <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="card p-8 max-w-md bg-white border border-gray-200 w-full animate-fade-in">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Friendly Warning</h3>
              <p className="text-sm text-gray-700 mb-6">
                Price optimization uses smart substitutions. The taste may vary slightly,
                but nutrition quality and condition safety will be maintained.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowOptimizeModal(false)} className="btn btn-outline text-gray-700 border-gray-300 hover:bg-gray-200 flex-1">
                  Cancel
                </button>
                <button onClick={handleConfirmOptimize} className="btn btn-primary flex-1">
                  Yes, optimize
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
