'use client';

import React, { useState } from 'react';
import { Radar, Kanban, User, Send, RefreshCw, Sparkles, ArrowRight, ArrowLeft, Zap, LogIn, LogOut, ChevronDown, Compass, Activity, ShieldCheck } from 'lucide-react';
import { AuthUser } from '@/types';

interface HeaderProps {
  activeTab: 'landing' | 'radar' | 'crm' | 'persona' | 'telegram' | 'pricing';
  setActiveTab: (tab: 'landing' | 'radar' | 'crm' | 'persona' | 'telegram' | 'pricing') => void;
  onRefreshScan: () => void;
  isScanning: boolean;
  leadCount: number;
  crmCount: number;
  userProfileName?: string;
  user: AuthUser | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  onRefreshScan,
  isScanning,
  leadCount,
  crmCount,
  userProfileName = 'Indie Builder',
  user,
  onOpenAuth,
  onSignOut
}: HeaderProps) {
  const isLanding = activeTab === 'landing';
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleEnterCockpit = () => {
    if (!user) {
      onOpenAuth('signup');
    } else {
      setActiveTab('radar');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand Logo & Status */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveTab('landing')}
          >
            <img
              src="/radarly-logo.png"
              alt="Radarly AI Logo"
              className="h-9 w-9 object-contain group-hover:scale-105 transition-transform drop-shadow-md"
            />
            <img
              src="/radarly-wordmark.png"
              alt="Radarly AI"
              className="h-7 object-contain"
            />
          </div>

          {!isLanding && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Streams Active</span>
            </div>
          )}
        </div>

        {/* Center Tab Navigation (Linear Style) */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#64748B]">
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el ? el.scrollIntoView({ behavior: 'smooth' }) : handleEnterCockpit();
              }}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={handleEnterCockpit}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Live Radar
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={handleEnterCockpit}
              className="hover:text-slate-950 transition-colors cursor-pointer"
            >
              Cockpit App
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 text-xs font-semibold text-[#64748B]">
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
                activeTab === 'radar'
                  ? 'bg-white text-slate-950 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <Radar className="h-3.5 w-3.5 text-blue-600" />
              <span>Live Radar</span>
              <span className="rounded-full bg-blue-50 text-blue-700 px-1.5 py-0.2 text-[10px] font-bold border border-blue-200/70">
                {leadCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
                activeTab === 'crm'
                  ? 'bg-white text-slate-950 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <Kanban className="h-3.5 w-3.5 text-indigo-600" />
              <span>CRM Pipeline</span>
              {crmCount > 0 && (
                <span className="rounded-full bg-indigo-50 text-indigo-700 px-1.5 py-0.2 text-[10px] font-bold border border-indigo-200/70">
                  {crmCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('telegram')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
                activeTab === 'telegram'
                  ? 'bg-white text-slate-950 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <Send className="h-3.5 w-3.5 text-sky-500" />
              <span>Telegram Bot</span>
            </button>

            <button
              onClick={() => setActiveTab('persona')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all cursor-pointer ${
                activeTab === 'persona'
                  ? 'bg-white text-slate-950 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  : 'hover:text-slate-900 text-slate-600'
              }`}
            >
              <User className="h-3.5 w-3.5 text-slate-600" />
              <span>Persona</span>
            </button>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 relative">
          {isLanding ? (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">{user.name}</span>
                    <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase">
                      {user.plan}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('radar')}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-all cursor-pointer"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="hidden sm:inline text-xs font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuth('signup')}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-[0_2px_8px_rgba(37,99,235,0.25)] transition-all cursor-pointer"
                  >
                    <span>Launch App</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onRefreshScan}
                disabled={isScanning}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-60 shadow-2xs"
                title="Scan for fresh leads"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">{isScanning ? 'Syncing...' : 'Sync Feeds'}</span>
              </button>

              <button
                onClick={() => setActiveTab('landing')}
                className="hidden sm:flex items-center gap-1 text-xs text-[#64748B] hover:text-slate-900 font-medium transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{(user?.name || userProfileName)[0]?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-500 mr-1" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-900">{user?.name || userProfileName}</p>
                      <p className="text-[11px] text-[#64748B] truncate">{user?.email || 'user@domain.com'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('persona');
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      <span>Persona & Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActiveTab('pricing');
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-500" />
                      <span>Upgrade Plan ({user?.plan?.toUpperCase() || 'PRO'})</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      {!isLanding && (
        <div className="flex md:hidden border-t border-slate-200 bg-white px-2 py-1.5 justify-around text-xs">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold ${
              activeTab === 'radar' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            <Radar className="h-3.5 w-3.5" />
            Radar ({leadCount})
          </button>
          <button
            onClick={() => setActiveTab('crm')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold ${
              activeTab === 'crm' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            CRM ({crmCount})
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold ${
              activeTab === 'telegram' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            Alerts
          </button>
          <button
            onClick={() => setActiveTab('persona')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold ${
              activeTab === 'persona' ? 'bg-blue-600 text-white' : 'text-slate-600'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Profile
          </button>
        </div>
      )}
    </header>
  );
}
