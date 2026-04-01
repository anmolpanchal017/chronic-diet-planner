'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface PDFUploaderProps {
  onUpload: (file: File, extractedData: any) => void
  isProcessing: boolean
  isSuccess: boolean
}

export default function PDFUploader({ onUpload, isProcessing, isSuccess }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0])
    }
  }

  const processFile = async (file: File) => {
    setError(null)

    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please upload a PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to parse PDF')
      }

      setExtractedData(result.data)
      onUpload(file, result.data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to process PDF'
      console.error('PDF upload error:', errorMsg)
      setError(errorMsg)
    }
  }

  if (isProcessing) {
    return (
      <div className="p-8 text-center">
        <Loader className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Processing your medical report...</p>
      </div>
    )
  }

  if (isSuccess && extractedData) {
    return (
      <div className="p-6 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-emerald-200">Medical Report Processed Successfully!</h3>
            <p className="text-sm text-emerald-300 mt-1">{extractedData.extractedInfo || 'Health information extracted and loaded'}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {/* Diabetes Info */}
          {extractedData.conditions?.diabetes?.detected && (
            <div className="p-2 bg-blue-500/20 border border-blue-500/50 rounded">
              <p className="font-medium text-blue-200">🩺 Diabetes Detected</p>
              <p className="text-xs text-blue-300">
                {extractedData.conditions.diabetes.hbA1c && `HbA1c: ${extractedData.conditions.diabetes.hbA1c}%`}
                {extractedData.conditions.diabetes.severity && ` (${extractedData.conditions.diabetes.severity})`}
              </p>
            </div>
          )}

          {/* Hypertension Info */}
          {extractedData.conditions?.hypertension?.detected && (
            <div className="p-2 bg-teal-500/20 border border-teal-500/50 rounded">
              <p className="font-medium text-teal-200">💉 Hypertension Detected</p>
              <p className="text-xs text-teal-300">
                {extractedData.conditions.hypertension.bpSystolic && `BP: ${extractedData.conditions.hypertension.bpSystolic}/${extractedData.conditions.hypertension.bpDiastolic} mmHg`}
                {extractedData.conditions.hypertension.severity && ` (${extractedData.conditions.hypertension.severity})`}
              </p>
            </div>
          )}

          {/* CKD Info */}
          {extractedData.conditions?.ckd?.detected && (
            <div className="p-2 bg-amber-500/20 border border-amber-500/50 rounded">
              <p className="font-medium text-amber-200">🏥 CKD Stage {extractedData.conditions.ckd.stage} Detected</p>
              <p className="text-xs text-amber-300">
                eGFR: {extractedData.conditions.ckd.eGFR} mL/min
                {extractedData.conditions.ckd.creatinine && `, Creatinine: ${extractedData.conditions.ckd.creatinine}`}
              </p>
            </div>
          )}

          {/* Heart Disease Info */}
          {extractedData.conditions?.heartDisease?.detected && (
            <div className="p-2 bg-pink-500/20 border border-pink-500/50 rounded">
              <p className="font-medium text-pink-200">❤️ Heart Disease Detected</p>
              <p className="text-xs text-pink-300">
                {extractedData.conditions.heartDisease.condition}
                {extractedData.conditions.heartDisease.severity && ` (${extractedData.conditions.heartDisease.severity})`}
              </p>
            </div>
          )}

          {/* Lab Values */}
          {(extractedData.labValues?.hbA1c || extractedData.labValues?.eGFR || extractedData.labValues?.potassium) && (
            <div className="p-2 bg-slate-700/50 border border-slate-600/50 rounded">
              <p className="font-medium text-slate-200 mb-1">Extracted Lab Values:</p>
              <div className="text-xs text-slate-400 space-y-0.5">
                {extractedData.labValues.hbA1c && <p>✓ HbA1c: {extractedData.labValues.hbA1c}%</p>}
                {extractedData.labValues.eGFR && <p>✓ eGFR: {extractedData.labValues.eGFR} mL/min</p>}
                {extractedData.labValues.bpSystolic && extractedData.labValues.bpDiastolic && (
                  <p>✓ BP: {extractedData.labValues.bpSystolic}/{extractedData.labValues.bpDiastolic} mmHg</p>
                )}
                {extractedData.labValues.creatinine && <p>✓ Creatinine: {extractedData.labValues.creatinine}</p>}
                {extractedData.labValues.potassium && <p>✓ Potassium: {extractedData.labValues.potassium} mEq/L</p>}
                {extractedData.labValues.phosphorus && <p>✓ Phosphorus: {extractedData.labValues.phosphorus} mg/dL</p>}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setExtractedData(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
          }}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-medium mt-4 text-sm transition-all duration-200 shadow-lg shadow-teal-500/20"
        >
          Upload Different Report
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Drag and Drop Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-8 border-2 border-dashed rounded-lg transition-all cursor-pointer ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/20'
            : 'border-slate-600/60 hover:border-slate-500/60 bg-slate-800/40'
        }`}
      >
        <div className="text-center">
          <Upload className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-emerald-400' : 'text-slate-400'}`} />
          <p className="font-medium text-slate-200 mb-1">Drag your PDF here or click to upload</p>
          <p className="text-xs text-slate-400">Blood test reports, HbA1c reports, and kidney function tests are all supported</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg font-medium mt-4 text-sm transition-all duration-200 shadow-lg shadow-blue-500/20"
          >
            Choose File
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-300">{error}</div>
        </div>
      )}

    </div>
  )
}
