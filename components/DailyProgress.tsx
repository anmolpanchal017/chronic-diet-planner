'use client'

import React from 'react'

interface GaugeMetric {
  label: string
  value: number
  max: number
  unit: string
  color: string
  icon?: React.ReactNode
}

interface DailyProgressProps {
  metrics: GaugeMetric[]
}

function CircularGauge({ metric }: { metric: GaugeMetric }) {
  const percentage = Math.min((metric.value / metric.max) * 100, 100)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1e293b"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={metric.color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 origin-center"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold text-white">{Math.round(metric.value)}{metric.unit}</div>
          <div className="text-xs text-slate-400">{metric.label}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-2 border border-slate-700/50">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: metric.color,
          }}
        />
      </div>
      <p className="text-xs text-slate-400">{Math.round(percentage)}% of target</p>
    </div>
  )
}

export default function DailyProgress({ metrics }: DailyProgressProps) {
  return (
    <div className="card p-8 bg-slate-800/80 border border-slate-700/80">
      <h3 className="text-2xl font-bold mb-2 text-white">Daily Progress</h3>
      <p className="text-slate-400 mb-8">Track your nutrition metrics for today</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <CircularGauge key={idx} metric={metric} />
        ))}
      </div>
    </div>
  )
}
