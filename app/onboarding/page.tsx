'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Upload, Leaf, AlertCircle } from 'lucide-react'
import { useAppState } from '@/components/AppStateProvider'
import Step1Form from '@/components/forms/Step1Form'
import Step2Form from '@/components/forms/Step2Form'
import Step3Form from '@/components/forms/Step3Form'
import DemoProfiles from '@/components/DemoProfiles'
import PDFUploader from '@/components/PDFUploader'
import { resolveConflicts } from '@/lib/nutritionTargets'

export default function OnboardingPage() {
  const { state, dispatch } = useAppState()
  const router = useRouter()
  const [showPDFSection, setShowPDFSection] = useState(false)
  const [pdfProcessing, setPdfProcessing] = useState(false)
  const [pdfSuccess, setPdfSuccess] = useState(false)

  const currentStep = state.currentStep

  const handleNext = () => {
    if (currentStep < 2) {
      dispatch({ type: 'SET_STEP', payload: currentStep + 1 })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch({ type: 'SET_STEP', payload: currentStep - 1 })
    }
  }

  const handleSubmit = async () => {
    try {
      if (!state.userProfile.fullName || !state.userProfile.conditions?.length) {
        dispatch({ type: 'SET_ERROR', payload: 'Please fill in all required fields' })
        return
      }

      const { envelope, conflicts } = resolveConflicts(
        state.userProfile.conditions as any[],
        state.userProfile
      )
      dispatch({
        type: 'SET_ENVELOPE',
        payload: { envelope, conflicts },
      })

      router.push('/preview')
    } catch (error) {
      console.error('Error submitting form:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to process form' })
    }
  }

  const handlePDFUpload = async (file: File, extractedData: any) => {
    setPdfProcessing(true)
    try {
      const updates: any = {
        labValues: { ...state.userProfile.labValues },
        conditions: [...(state.userProfile.conditions || [])],
        conditionSeverities: { ...(state.userProfile.conditionSeverities || {}) },
      }

      if (extractedData.labValues) {
        updates.labValues = {
          ...updates.labValues,
          ...(extractedData.labValues.hbA1c && { hbA1c: extractedData.labValues.hbA1c }),
          ...(extractedData.labValues.bpSystolic && { bpSystolic: extractedData.labValues.bpSystolic }),
          ...(extractedData.labValues.bpDiastolic && { bpDiastolic: extractedData.labValues.bpDiastolic }),
          ...(extractedData.labValues.eGFR && { eGFR: extractedData.labValues.eGFR }),
        }
      }

      dispatch({
        type: 'UPDATE_PROFILE',
        payload: updates,
      })

      setPdfSuccess(true)
      setTimeout(() => setPdfProcessing(false), 2000)
    } catch (error) {
      console.error('Error processing PDF:', error)
      setPdfProcessing(false)
    }
  }

  const stepTitles = [
    'Personal & Medical Information',
    'Dietary Preferences & Lifestyle',
    'Budget & Medical Reports',
  ]

  const stepDescriptions = [
    'Tell us about your basic health profile',
    'Help us customize your meal preferences',
    'Set your budget and upload medical reports',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900">
      {/* Header */}
      <header className="bg-white/90 border-b border-gray-200 backdrop-blur sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">NutriPlan AI</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Demo Profiles */}
        {currentStep === 0 && (
          <div className="mb-8">
            <DemoProfiles />
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{stepTitles[currentStep]}</h2>
              <p className="text-gray-700 mt-2">{stepDescriptions[currentStep]}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-emerald-400">
                Step {currentStep + 1} of 3
              </div>
              <div className="text-3xl font-bold text-emerald-400">
                {Math.round(((currentStep + 1) / 3) * 100)}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-transparent rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50"
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2 mb-12">
          {[0, 1, 2].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-all ${
                step < currentStep
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/50'
                  : step === currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Form Card */}
        <div className="card p-8 md:p-12 mb-8 bg-white border border-gray-200">
          {currentStep === 0 && (
            <Step1Form
              profile={state.userProfile}
              onUpdate={(updates) => dispatch({ type: 'UPDATE_PROFILE', payload: updates })}
            />
          )}

          {currentStep === 1 && (
            <Step2Form
              profile={state.userProfile}
              onUpdate={(updates) => dispatch({ type: 'UPDATE_PROFILE', payload: updates })}
            />
          )}

          {currentStep === 2 && (
            <div>
              <Step3Form
                profile={state.userProfile}
                onUpdate={(updates) => dispatch({ type: 'UPDATE_PROFILE', payload: updates })}
              />

              {/* PDF Upload Section */}
              {!showPDFSection && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600/60 to-cyan-600/60 border border-blue-500/80 rounded-xl shadow-lg shadow-blue-500/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/70 rounded-lg">
                      <Upload className="w-6 h-6 text-gray-900" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-50 mb-1">Upload Medical Report (Optional)</h3>
                      <p className="text-sm text-blue-100 mb-3">
                        Upload your blood test or medical report to automatically extract lab values and detect conditions. This helps create a more accurate meal plan.
                      </p>
                      <button
                        onClick={() => setShowPDFSection(true)}
                        className="btn bg-white text-blue-600 hover:bg-blue-50 font-semibold gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload PDF
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showPDFSection && (
                <div className="mt-8">
                  <PDFUploader
                    onUpload={handlePDFUpload}
                    isProcessing={pdfProcessing}
                    isSuccess={pdfSuccess}
                  />
                  <button
                    onClick={() => setShowPDFSection(false)}
                    className="btn btn-outline w-full mt-4"
                  >
                    Skip PDF Upload
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="card p-4 bg-red-500/60 border border-red-400/80 flex items-start gap-3 mb-8 shadow-lg shadow-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-100 font-medium">{state.error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button onClick={handleBack} className="btn btn-secondary gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}

          <div className="flex-1" />

          {currentStep < 2 ? (
            <button onClick={handleNext} className="btn btn-primary gap-2">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-primary gap-2 text-lg px-8 py-3">
              Create My Health Plan
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600 mt-8">
          ✓ Your data is secure and used only for your meal plan • No account needed • Takes ~5 minutes
        </p>
      </main>
    </div>
  )
}
