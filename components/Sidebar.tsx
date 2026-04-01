'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Utensils, BarChart3, LineChart, Settings, LogOut, Leaf, Sun, Moon, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppState } from './AppStateProvider'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { state, dispatch } = useAppState()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Utensils, label: 'Meal Plans', href: '/plan' },
    { icon: BarChart3, label: 'Health Scores', href: '/health-scores' },
    { icon: LineChart, label: 'Analytics', href: '/analytics' },
  ]

  const handleLogout = () => {
    dispatch({ type: 'RESET' })
    router.push('/')
  }

  const isActive = (href: string) => pathname === href

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-700/50 shadow-lg shadow-emerald-500/10 z-40 flex flex-col">
      {/* Header Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-white">NutriPlan AI</div>
            <div className="text-xs text-slate-400">Clinical Sanctuary</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 border-b border-slate-700/50">
        <input
          type="text"
          placeholder="Search health metrics..."
          className="w-full px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                  active
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400/50'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-emerald-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Settings Section */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-500 uppercase px-4 mb-3">Settings</h4>
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-slate-400 hover:bg-slate-800/50`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>

      {/* User Profile & Footer */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-3 border border-slate-700/50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-white truncate">{state.userProfile.fullName || 'User'}</div>
            <div className="text-xs text-slate-400 truncate">{state.userProfile.conditions?.[0] || 'No plan'}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  )
}
