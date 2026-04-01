'use client'

import React from 'react'
import { Lightbulb } from 'lucide-react'

interface AIInsightProps {
  title: string
  description: string
  recommendation: string
  icon?: React.ReactNode
}

export default function AIInsight({
  title = 'AI Insight',
  description = 'Your insulin sensitivity is peaking. This is the optimal window for your high-protein lunch to maximize muscle protein synthesis.',
  recommendation = '',
  icon,
}: AIInsightProps) {
  return (
    <div className="card p-6 bg-white border-l-4 border-l-emerald-500 shadow-emerald-500/10">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {icon ? (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500">
              {icon}
            </div>
          ) : (
            <Lightbulb className="w-6 h-6 text-emerald-400 mt-1" />
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-700 mb-3">{description}</p>
          {recommendation && (
            <p className="text-xs font-medium text-emerald-300 bg-emerald-900/50 px-2 py-1 rounded inline-block border border-emerald-500/30">
              💡 {recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
