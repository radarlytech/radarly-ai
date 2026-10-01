'use client';

import React, { useState } from 'react';
import {
  Radar,
  Zap,
  Send,
  Kanban,
  CheckCircle2,
  Check,
  ArrowRight,
  Shield,
  ChevronDown,
  ChevronUp,
  Globe,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  Search,
  Bell,
  Sliders,
  Filter,
  ArrowUpRight,
  MessageSquare,
  Lock,
  ExternalLink,
  Flame,
  Radio,
  Star,
  Users,
  Award,
  CheckCheck,
  Smartphone,
  MousePointerClick,
  Activity,
  Cpu,
  RefreshCw,
  Gauge,
  Wallet,
  Timer,
  X,
  Target,
  Layers,
  Bot,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenPricing: () => void;
}

export function LandingPage({ onEnterApp, onOpenPricing }: LandingPageProps) {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="w-full text-slate-700 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* SECTION 1: HERO SECTION */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/40 via-indigo-50/20 to-[#FAFBFC]">
        {/* Ambient Glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] bg-gradient-to-b from-blue-200/40 via-indigo-200/25 to-transparent blur-[130px] pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-96 h-96 bg-purple-100/30 blur-[100px] pointer-events-none -z-10" />

        <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 pt-14 pb-18 text-center flex flex-col items-center">
          {/* Live Superbadge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-700 font-semibold">
              Live Network Active: Harvesting 𝕏 (Twitter), Reddit &amp; Hacker News in Real Time
            </span>
          </div>

          {/* Radiant Gradient Headline */}
          <h1 className="text-[40px] sm:text-[54px] lg:text-[64px] leading-[1.08] font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto mb-6">
            Stop Losing High-Ticket Clients to 300+ Upwork Bidders.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Intercept Hiring Founders in the First 15 Minutes.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            Radarly AI autonomous radar continuously intercepts client hiring conversations the minute they are posted — enabling freelance engineers and boutique agencies to pitch verified buyers before job boards get saturated.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-6">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Launch Live Radar — 100% Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Friction Reducers */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#64748B] font-medium mb-12">
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" /> Setup in 60 seconds
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-emerald-600" /> 100% Direct Client Invoicing
            </span>
          </div>

          {/* Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-200/80 max-w-4xl w-full mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-slate-900 leading-tight">2,400+</div>
                <div className="text-[11px] text-[#64748B] font-medium">Engineers &amp; Agencies</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-emerald-600 leading-tight">$3.2M+</div>
                <div className="text-[11px] text-[#64748B] font-medium">Contracts Closed</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Star className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-slate-900 leading-tight">4.9/5</div>
                <div className="text-[10px] text-[#64748B] font-medium">User Rating</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Timer className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-slate-900 leading-tight">&lt;60s</div>
                <div className="text-[11px] text-[#64748B] font-medium">Alert Delivery Speed</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 2: 4 CORE ARCHITECTURAL PILLARS (Clean Bento Grid) */}
      <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 py-16" id="about">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3">
            Why Radarly Outperforms Job Boards
          </div>
          <h2 className="text-[32px] sm:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Engineered for <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">High-Ticket Speed</span>
          </h2>
          <p className="text-[#64748B] mt-2 text-sm sm:text-base">
            The first responder gets 70% of client interviews. Radarly eliminates hours of doomscrolling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {/* Pillar 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-blue-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-105 transition-transform">
                <Globe className="h-6 w-6" />
              </div>
              <div className="font-mono text-blue-600 text-xs font-semibold mb-1">01 / MULTI-CHANNEL</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Zero-Cost Autonomous Scrapers</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Monitors 𝕏 keywords, Reddit subreddits (r/forhire, r/freelance, r/reactjs), and Hacker News hiring threads 24/7 without paid API fees.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-blue-600 font-semibold flex items-center gap-1">
              <span>Sub-minute indexing</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <div className="font-mono text-indigo-600 text-xs font-semibold mb-1">02 / AI PITCH STUDIO</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tailored 1-Click Angles</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Analyzes founder pain points and outputs four personalized responses matching your tone: Technical Authority, Quick Turnaround, or Friendly Consultant.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-indigo-600 font-semibold flex items-center gap-1">
              <span>280-char optimized</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-105 transition-transform">
                <Kanban className="h-6 w-6" />
              </div>
              <div className="font-mono text-emerald-600 text-xs font-semibold mb-1">03 / PIPELINE CRM</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Lightweight Revenue Board</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Auto-save leads into a 6-stage Kanban board (New Leads, Researching, Pitch Sent, Follow Up, Negotiation, Won). Never lose track of a conversation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span>Zero clutter pipeline</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-purple-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4 group-hover:scale-105 transition-transform">
                <Send className="h-6 w-6" />
              </div>
              <div className="font-mono text-purple-600 text-xs font-semibold mb-1">04 / INSTANT PUSH</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Sub-60s Telegram Alerts</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Get vibrating alerts on your phone seconds after a verified founder posts. Tap the notification, copy your custom pitch, and reply immediately.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-purple-600 font-semibold flex items-center gap-1">
              <span>Instant mobile dispatch</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LINEAR ACQUISITION COMPARISON */}
      <section className="relative w-full max-w-5xl mx-auto px-6 sm:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-3">
            The Cold Hard Math
          </div>
          <h2 className="text-[32px] sm:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Why Traditional Freelancing is <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Broken</span>
          </h2>
          <p className="text-[#64748B] mt-2 text-sm sm:text-base">
            Comparing the old Upwork/Fiverr bid grind vs our Autonomous Social Interception model.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
            {/* The Old Way */}
            <div className="p-6 lg:p-8 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-4">
                <X className="h-6 w-6 text-rose-500" />
                <h3 className="text-lg font-bold text-slate-900">The Traditional Upwork Grind</h3>
              </div>
              <ul className="flex flex-col gap-4 text-xs sm:text-sm text-[#64748B]">
                <li className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">250-400 competitor bids</strong> on every posting within 45 minutes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">10% to 20% platform tax</strong> deducted directly from your earnings</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">Race to the bottom</strong> on price against low-cost offshore agencies</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Paid tokens required just to submit a proposal</span>
                </li>
              </ul>
            </div>

            {/* The Radarly AI Way */}
            <div className="p-6 lg:p-8 bg-gradient-to-br from-blue-50/40 via-indigo-50/20 to-purple-50/30">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">The Radarly AI Intercept</h3>
              </div>
              <ul className="flex flex-col gap-4 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">First 1-3 proposals</strong> received by the founder while they are still online</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">0% platform commission</strong> — you invoice directly via Stripe / Wire</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong className="text-slate-900">High-budget founders</strong> willing to pay $3k-$15k for fast, reliable talent</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Direct DM access to decision makers without middleman gatekeepers</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TECHNICAL NICHE CALLOUT */}
      <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 py-16">
        <div className="p-8 lg:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
          <div className="max-w-xl">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3 inline-block">
              Tailored For Your Technical Niche
            </span>
            <h2 className="text-[28px] sm:text-[38px] font-extrabold text-slate-900 leading-tight mb-4">
              Whether You Build <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Next.js Web Apps</span> or Fine-Tune LLMs
            </h2>
            <p className="text-[#64748B] leading-relaxed mb-6 text-sm sm:text-base">
              Radarly lets you define specialized technology monitors (React, iOS, Rust, Python AI, Figma, Webflow). Get alerted only when high-paying clients ask for your exact skill stack.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold">Full-Stack Web</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold">Mobile (RN/Flutter)</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold">AI &amp; RAG Agents</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-xs font-semibold">Boutique Dev Agencies</span>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={onEnterApp}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm text-center transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] cursor-pointer"
            >
              Configure Custom Radar
            </button>
            <button
              onClick={onOpenPricing}
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm text-center transition-all cursor-pointer"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 5: PRICING TIERS & GUARANTEE */}
      <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 py-16" id="pricing">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3">
            Predictable ROI
          </div>
          <h2 className="text-[32px] sm:text-[42px] font-extrabold text-slate-900 tracking-tight leading-tight">
            One Closed Deal Pays for <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">2 Years</span>
          </h2>
          <p className="text-[#64748B] mt-2 text-sm sm:text-base">
            Zero commissions. Zero hidden tokens. Close just one $3,000 contract and achieve 150x return on investment.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mt-6">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isAnnual ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnual ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Annual (Save 20%)</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">PROMO</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch text-left">
          {/* Tier 1: Free Starter */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900 mb-1">Free Radar</div>
              <div className="text-xs text-[#64748B] mb-4">Test the engine and catch initial leads.</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">$0</span>
                <span className="text-[#64748B] text-xs font-medium">/ forever free</span>
              </div>
              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-[#64748B] pb-6 border-b border-slate-100">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> 1 Tracked Social Keyword</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Live Web Radar Feed</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> 5 AI Pitch Generations / day</li>
                <li className="flex items-center gap-2 text-slate-400"><X className="h-4 w-4" /> Instant Telegram Push</li>
              </ul>
            </div>
            <button
              onClick={onEnterApp}
              className="w-full mt-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-semibold text-xs transition-all cursor-pointer"
            >
              Start Free Now
            </button>
          </div>

          {/* Tier 2: Pro Hunter (Featured) */}
          <div className="relative p-6 rounded-2xl bg-white border-2 border-blue-600 shadow-[0_8px_30px_rgba(37,99,235,0.12)] flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
              MOST POPULAR
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 mb-1">Pro Hunter</div>
              <div className="text-xs text-[#64748B] mb-4">For freelancers &amp; consultants ready to scale.</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-blue-600">{isAnnual ? '$15' : '$19'}</span>
                <span className="text-[#64748B] text-xs font-medium">/ month {isAnnual ? '(billed annually)' : ''}</span>
              </div>
              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-slate-700 pb-6 border-b border-slate-100">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> <strong className="text-slate-900">Unlimited</strong> Custom Keywords &amp; Subreddits</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> <strong className="text-slate-900">Sub-60s Telegram Alerts</strong></li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Unlimited AI Precision Pitches</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Full 6-Stage Revenue CRM</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Intent Scoring Algorithm (90+ Intent)</li>
              </ul>
            </div>
            <button
              onClick={onOpenPricing}
              className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center font-bold text-xs shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all cursor-pointer"
            >
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Tier 3: Founder Lifetime Deal */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900 mb-1">Founder Lifetime</div>
              <div className="text-xs text-[#64748B] mb-4">One-time investment. Lifetime radar access.</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">$69</span>
                <span className="text-[#64748B] text-xs font-medium">/ lifetime one-time</span>
              </div>
              <ul className="flex flex-col gap-3 text-xs sm:text-sm text-[#64748B] pb-6 border-b border-slate-100">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Lifetime Pro Hunter Access</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> All Future Platform Updates</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Priority Telegram Delivery Webhook</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Private Agency Mastermind Access</li>
              </ul>
            </div>
            <button
              onClick={onOpenPricing}
              className="w-full mt-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-center font-semibold text-xs transition-all cursor-pointer"
            >
              Claim Lifetime License
            </button>
          </div>
        </div>

        {/* Guarantee Badge */}
        <div className="max-w-xl mx-auto mt-10 p-4 rounded-2xl bg-white border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div className="text-xs text-[#64748B]">
            <strong className="text-slate-900">100% Risk-Free 30-Day Guarantee:</strong> If you don't book at least 3 qualified founder discovery calls within your first 30 days, we'll refund every penny immediately.
          </div>
        </div>
      </section>

      {/* SECTION 6: FAQ ACCORDIONS */}
      <section className="relative w-full max-w-4xl mx-auto px-6 sm:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-[30px] sm:text-[38px] font-extrabold text-slate-900 tracking-tight">
            Frequently Asked <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-[#64748B] mt-2 text-sm sm:text-base">Everything you need to know about how Radarly works.</p>
        </div>

        <div className="flex flex-col gap-3 text-left">
          {[
            {
              q: 'How fast does Radarly detect client postings?',
              a: 'Our scrapers poll 𝕏, Reddit, and Hacker News on continuous sub-60-second loops. Alerts typically land on your Telegram within 15 to 45 seconds of the client publishing their request.'
            },
            {
              q: 'Does this violate Twitter / 𝕏 or Reddit API terms?',
              a: 'No. Radarly uses publicly accessible web discovery nodes and zero-cost headless parsing of public feeds. We never automate spam or unauthorized actions on your personal accounts.'
            },
            {
              q: 'Do you take any cut or commission from my closed contracts?',
              a: 'Zero percent. Unlike Upwork or Fiverr which extract 10-20% of every dollar you earn, you keep 100% of your contract value. You bill your clients directly via your preferred method.'
            },
            {
              q: 'Can I customize the skills and keywords it monitors?',
              a: 'Yes. You can filter by technical stack (e.g. Next.js, Supabase, Solidity, Python, React Native), budget thresholds (e.g. min $3,000), and specific subreddits or founder accounts.'
            }
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="rounded-2xl bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-slate-900 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-[#64748B] text-xs sm:text-sm leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 7: FINAL HIGH-CONVERSION CTA BANNER */}
      <section className="relative w-full max-w-5xl mx-auto px-6 sm:px-8 py-16 text-center">
        <div className="relative p-10 lg:p-14 rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/70 border border-blue-200/80 shadow-[0_8px_30px_rgba(37,99,235,0.08)] flex flex-col items-center">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold uppercase tracking-wider mb-4">
            Ready to Intercept Your Next $5k Client?
          </span>
          <h2 className="text-[32px] sm:text-[44px] font-extrabold text-slate-900 tracking-tight max-w-2xl leading-tight mb-4">
            Stop Bidding Against the World.<br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Pitch Founders When They Need You.
            </span>
          </h2>
          <p className="text-[#64748B] max-w-lg mb-8 text-sm sm:text-base leading-relaxed">
            Join 2,400+ developers, designers, and agencies intercepting verified high-intent opportunities 24 hours a day.
          </p>
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-base shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <span>Launch Radar Now — Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <div className="text-xs text-[#64748B] mt-4 font-medium">
            Instant setup • No credit card required • Cancel anytime
          </div>
        </div>
      </section>
    </div>
  );
}
