'use client';

import React from 'react';
import { X, Check, Sparkles, Zap, Shield, Trophy } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto text-slate-900">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
            <Sparkles className="h-3.5 w-3.5" /> Early Founder Launch Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Land 1 Client. Pay for Radarly for Life.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Find high-budget projects on social platforms before anyone else and 10x your client acquisition.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Free Tier */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Free Starter</h3>
                <p className="text-xs text-slate-500">Basic lead discovery for casual exploring.</p>
              </div>
              <div className="text-3xl font-black text-slate-900">$0</div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" /> 3 Lead alerts / day
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" /> 1 Target Subreddit monitor
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" /> Standard AI Pitch drafter
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" /> Basic CRM Pipeline
                </li>
              </ul>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all shadow-xs"
            >
              Current Active Plan
            </button>
          </div>

          {/* Pro Monthly Tier */}
          <div className="rounded-2xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/60 to-white p-6 flex flex-col justify-between space-y-6 shadow-md shadow-indigo-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-indigo-700">Pro Monthly</h3>
                <span className="rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold">Popular</span>
              </div>
              <p className="text-xs text-slate-600">For serious freelancers & agencies.</p>
              <div className="text-3xl font-black text-slate-900">
                $19<span className="text-xs font-normal text-slate-500">/month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" /> <b>Unlimited</b> real-time lead alerts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" /> Instant <b>Telegram Bot Alerts</b>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" /> Gemini 1.5 Flash AI Pitch engine
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" /> All 12+ subreddits & forums
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" /> Custom Persona & portfolio weaving
                </li>
              </ul>
            </div>

            <button
              onClick={() => alert('Stripe Checkout will be connected to your account!')}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-all"
            >
              Subscribe for $19/mo
            </button>
          </div>

          {/* Lifetime Deal (LTD) */}
          <div className="relative rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/50 to-white p-6 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-800">Founder Lifetime</h3>
                <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">14 Spots Left</span>
              </div>
              <p className="text-xs text-slate-600">Pay once, keep it forever. Zero subscriptions.</p>
              <div className="text-3xl font-black text-slate-900">
                $69<span className="text-xs font-normal text-slate-500"> one-time</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2 font-semibold text-amber-900">
                  <Trophy className="h-4 w-4 text-amber-600 shrink-0" /> <b>All Pro Features for Life</b>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-600 shrink-0" /> Priority radar scanning queue
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-600 shrink-0" /> Chrome Extension Beta access (Week 3)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-amber-600 shrink-0" /> Direct founder support & roadmap input
                </li>
              </ul>
            </div>

            <button
              onClick={() => alert('Stripe Checkout will be connected to your account!')}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-500/20 hover:brightness-105 transition-all"
            >
              Claim Lifetime Access ($69)
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-600 flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>30-Day Money-Back Guarantee. Cancel or request refund anytime with 1-click.</span>
        </div>
      </div>
    </div>
  );
}
