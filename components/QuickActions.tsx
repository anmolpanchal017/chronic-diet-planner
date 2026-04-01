'use client'

import React from 'react'

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: 'green' | 'blue' | 'gray'
  onClick?: () => void
}

const colorClasses = {
  green: 'bg-emerald-500 hover:bg-emerald-600',
  blue: 'bg-blue-500 hover:bg-blue-600',
  gray: 'bg-slate-500 hover:bg-slate-600',
}

const bgColorClasses = {
  green: 'bg-emerald-500/20',
  blue: 'bg-blue-500/20',
  gray: 'bg-slate-700',
}

export function ActionCard({ icon, title, description, color, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="card p-6 text-center hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 group cursor-pointer bg-slate-800/80 border border-slate-700/80"
    >
      <div className={`flex items-center justify-center w-16 h-16 rounded-full ${bgColorClasses[color]} mx-auto mb-4 group-hover:scale-110 transition-transform`}>
        <div className={`${colorClasses[color]} p-3 rounded-full text-white transition-all shadow-lg`}>
          {icon}
        </div>
      </div>
      <h4 className="font-bold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400">{description}</p>
    </button>
  )
}

interface QuickActionsProps {
  onLogMeal?: () => void
  onAddActivity?: () => void
  onUpdateHealth?: () => void
}

export default function QuickActions({
  onLogMeal,
  onAddActivity,
  onUpdateHealth,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ActionCard
        icon={<span className="text-2xl">❌</span>}
        title="Log Meal"
        description="Track your latest nutrition"
        color="green"
        onClick={onLogMeal}
      />
      <ActionCard
        icon={<span className="text-2xl">🎯</span>}
        title="Add Activity"
        description="Sync workouts or steps"
        color="blue"
        onClick={onAddActivity}
      />
      <ActionCard
        icon={<span className="text-2xl">📊</span>}
        title="Update Health"
        description="Vitals and bio-markers"
        color="gray"
        onClick={onUpdateHealth}
      />
    </div>
  )
}
