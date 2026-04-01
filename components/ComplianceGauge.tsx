'use client'

import { Activity, Zap, Heart } from 'lucide-react'

interface ComplianceMetric {
  label: string
  value: number
  target: number
  unit: string
  status: 'good' | 'warning' | 'danger'
  icon: React.ReactNode
}

interface ComplianceGaugeProps {
  title: string
  metrics: ComplianceMetric[]
  condition: string
}

export function ComplianceGauge({ title, metrics, condition }: ComplianceGaugeProps) {
  const getColorClass = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-400'
      case 'warning':
        return 'text-amber-400'
      case 'danger':
        return 'text-red-400'
      default:
        return 'text-slate-400'
    }
  }

  const getBgColorClass = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-emerald-500/20'
      case 'warning':
        return 'bg-amber-500/20'
      case 'danger':
        return 'bg-red-500/20'
      default:
        return 'bg-slate-700/30'
    }
  }

  const getBorderColorClass = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-emerald-500/50'
      case 'warning':
        return 'border-amber-500/50'
      case 'danger':
        return 'border-red-500/50'
      default:
        return 'border-slate-600/50'
    }
  }

  return (
    <div className="card p-6 bg-slate-800/80 border border-slate-700/80">
      <h3 className="text-lg font-bold mb-4 text-white">{condition}</h3>
      <div className="space-y-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border ${getBgColorClass(metric.status)} ${getBorderColorClass(
              metric.status
            )}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${getColorClass(metric.status)}`} />
                <span className="font-semibold text-sm text-slate-200">{metric.label}</span>
              </div>
              <span className={`font-bold text-lg ${getColorClass(metric.status)}`}>
                {metric.value}{metric.unit}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metric.status === 'good'
                    ? 'bg-emerald-500'
                    : metric.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
              />
            </div>

            <div className="text-xs text-slate-400 mt-2">
              Target: {metric.target}{metric.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ComplianceOverview({ conditions }: { conditions: string[] | undefined }) {
  if (!conditions || conditions.length === 0) {
    return <div className="card p-6 text-center text-slate-400 bg-slate-800/80 border border-slate-700/80">No conditions found</div>
  }

  // Sample compliance data - in real app this would come from plan validation
  const complianceMap: Record<string, ComplianceMetric[]> = {
    DIABETES: [
      {
        label: 'Carbs',
        value: 240,
        target: 250,
        unit: 'g',
        status: 'good',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: 'Fiber',
        value: 35,
        target: 30,
        unit: 'g',
        status: 'good',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'GI Index Avg',
        value: 45,
        target: 55,
        unit: '',
        status: 'good',
        icon: <Heart className="w-4 h-4" />,
      },
    ],
    HYPERTENSION: [
      {
        label: 'Sodium',
        value: 1200,
        target: 1500,
        unit: 'mg',
        status: 'good',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'Potassium',
        value: 3000,
        target: 3500,
        unit: 'mg',
        status: 'warning',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: 'Fat (Saturated)',
        value: 18,
        target: 22,
        unit: 'g',
        status: 'good',
        icon: <Heart className="w-4 h-4" />,
      },
    ],
    CKD_STAGE_3: [
      {
        label: 'Protein',
        value: 52,
        target: 42,
        unit: 'g',
        status: 'warning',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'Phosphorus',
        value: 550,
        target: 600,
        unit: 'mg',
        status: 'good',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: 'Potassium',
        value: 1800,
        target: 2000,
        unit: 'mg',
        status: 'good',
        icon: <Heart className="w-4 h-4" />,
      },
    ],
    CKD_STAGE_4: [
      {
        label: 'Protein',
        value: 38,
        target: 28,
        unit: 'g',
        status: 'danger',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'Phosphorus',
        value: 680,
        target: 600,
        unit: 'mg',
        status: 'warning',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: 'Potassium',
        value: 2100,
        target: 2000,
        unit: 'mg',
        status: 'warning',
        icon: <Heart className="w-4 h-4" />,
      },
    ],
    HEART_DISEASE: [
      {
        label: 'Sodium',
        value: 1100,
        target: 1500,
        unit: 'mg',
        status: 'good',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'Saturated Fat',
        value: 16,
        target: 20,
        unit: 'g',
        status: 'good',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: 'Fiber',
        value: 32,
        target: 28,
        unit: 'g',
        status: 'good',
        icon: <Heart className="w-4 h-4" />,
      },
    ],
    OBESITY: [
      {
        label: 'Calories',
        value: 1800,
        target: 1800,
        unit: 'kcal',
        status: 'good',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'Protein',
        value: 95,
        target: 90,
        unit: 'g',
        status: 'good',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: 'Fiber',
        value: 38,
        target: 30,
        unit: 'g',
        status: 'good',
        icon: <Heart className="w-4 h-4" />,
      },
    ],
    PCOD: [
      {
        label: 'Carbs (Low GI)',
        value: 220,
        target: 250,
        unit: 'g',
        status: 'good',
        icon: <Activity className="w-4 h-4" />,
      },
      {
        label: 'Protein',
        value: 85,
        target: 80,
        unit: 'g',
        status: 'good',
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: 'Omega-3 Intake',
        value: 2,
        target: 2.5,
        unit: 'g',
        status: 'warning',
        icon: <Heart className="w-4 h-4" />,
      },
    ],
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {conditions.map(condition => (
        <ComplianceGauge
          key={condition}
          title={condition}
          condition={condition}
          metrics={complianceMap[condition] || []}
        />
      ))}
    </div>
  )
}
