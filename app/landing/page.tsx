'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf, Zap, BarChart3, ShoppingCart, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-gray-900" />
            </div>
            <div className="text-gray-900 font-bold text-lg hidden sm:block">NutriPlan AI</div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-emerald-700 transition-colors">Features</a>
            <a href="#benefits" className="text-gray-700 hover:text-emerald-700 transition-colors">Benefits</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-emerald-700 transition-colors">How It Works</a>
          </nav>

          <button
            onClick={() => router.push('/onboarding')}
            className="btn bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-300">AI-Powered Nutrition Planning</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Personalized Meal Plans<br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            for Chronic Disease Management
          </span>
        </h1>

        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Get AI-generated 7-day meal plans tailored to your chronic conditions with real-time nutritional compliance tracking and budget management.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={() => router.push('/onboarding')}
            className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-lg py-3 px-8 shadow-lg hover:shadow-emerald-500/50"
          >
            Start Creating Your Plan <ArrowRight className="w-5 h-5" />
          </button>
          <button
            className="btn border-2 border-gray-400 text-gray-900 hover:bg-gray-100"
          >
            View Demo
          </button>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="card p-6 bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500/80 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 cursor-pointer scale-100 hover:scale-105">
            <div className="w-14 h-14 rounded-lg bg-blue-500/60 flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="w-7 h-7 text-gray-900" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Diabetes Profile</h3>
            <p className="text-sm text-blue-100">58yr • Hypertension • ₹150/day</p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-amber-500 to-amber-600 border border-amber-500/80 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 cursor-pointer scale-100 hover:scale-105">
            <div className="w-14 h-14 rounded-lg bg-amber-500/60 flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-7 h-7 text-gray-900" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">CKD Profile</h3>
            <p className="text-sm text-amber-100">45yr • South Indian • ₹120/day</p>
          </div>

          <div className="card p-6 bg-gradient-to-br from-pink-600 to-rose-700 border border-pink-500/80 hover:border-pink-400 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 cursor-pointer scale-100 hover:scale-105">
            <div className="w-14 h-14 rounded-lg bg-pink-500/60 flex items-center justify-center mb-4 mx-auto">
              <ShoppingCart className="w-7 h-7 text-gray-900" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 text-lg">Heart Disease</h3>
            <p className="text-sm text-pink-100">62yr • Hypertension • ₹200/day</p>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="card p-8 bg-white/90 border border-emerald-500/40 hover:border-emerald-400/80 hover:bg-gray-100 hover:shadow-2xl hover:shadow-emerald-500/20 text-left transition-all duration-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Condition Support</h3>
            <p className="text-gray-700">
              Supports Diabetes, Hypertension, CKD, Heart Disease, Obesity, and PCOD with condition-specific nutrition targets.
            </p>
          </div>

          <div className="card p-8 bg-white/90 border border-teal-500/40 hover:border-teal-400/80 hover:bg-gray-100 hover:shadow-2xl hover:shadow-teal-500/20 text-left transition-all duration-300">
            <CheckCircle2 className="w-8 h-8 text-teal-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Lab-Aware Planning</h3>
            <p className="text-gray-700">
              Upload medical reports to auto-extract lab values and detect conditions for personalized recommendations.
            </p>
          </div>

          <div className="card p-8 bg-white/90 border border-blue-500/40 hover:border-blue-400/80 hover:bg-gray-100 hover:shadow-2xl hover:shadow-blue-500/20 text-left transition-all duration-300">
            <CheckCircle2 className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Budget Tracking</h3>
            <p className="text-gray-700">
              Real-time cost calculation with meal swapping to stay within your daily budget constraints.
            </p>
          </div>

          <div className="card p-8 bg-white/90 border border-amber-500/40 hover:border-amber-400/80 hover:bg-gray-100 hover:shadow-2xl hover:shadow-amber-500/20 text-left transition-all duration-300">
            <CheckCircle2 className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Indian Cuisine Database</h3>
            <p className="text-gray-700">
              85+ authentic Indian dishes with complete nutritional data and regional preferences.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="card p-12 bg-gradient-to-r from-emerald-500 to-teal-500 border border-emerald-400/60 text-center shadow-2xl shadow-emerald-500/30">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Health?</h2>
          <p className="text-emerald-50 mb-8 max-w-xl mx-auto font-medium">
            Create your personalized meal plan in 3 easy steps. No credit card required.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="btn bg-white text-emerald-600 hover:bg-emerald-50 font-semibold text-lg py-3 px-8 shadow-lg"
          >
            Start Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/90 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-600">
          <p>© 2026 NutriPlan AI. Powered by Anthropic Claude & Groq.</p>
        </div>
      </footer>
    </div>
  )
}
