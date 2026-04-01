'use client'

import React from 'react'
import { Zap } from 'lucide-react'

interface VitalityScoreProps {
  score: number
  maxScore?: number
  trend?: 'up' | 'down' | 'stable'
}

export default function VitalityScore({ score = 84, maxScore = 100, trend = 'up' }: VitalityScoreProps) {
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="card p-8 bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-xl">
      <div className="flex flex-col items-center justify-center">
        <p className="text-gray-700 text-sm font-medium mb-6">Your metabolic efficiency today</p>
        
        <div className="relative w-64 h-64 mb-8">
          {/* Circle Background */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={percentage > 70 ? '#10b981' : percentage > 40 ? '#f59e0b' : '#ef4444'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold text-gray-900">{Math.round(score)}</div>
            <div className="text-xl text-gray-600">/ {maxScore}</div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vitality Score</h2>
        <p className="text-gray-600 text-center text-sm">Track your overall metabolic health & nutritional compliance</p>
      </div>
    </div>
  )
}
