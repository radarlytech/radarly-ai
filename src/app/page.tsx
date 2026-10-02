'use client';

import React, { useState, useEffect } from 'react';
import { Lead, UserProfile, TelegramConfig, AuthUser } from '@/types';
import { Header } from '@/components/Header';
import { LandingPage } from '@/components/LandingPage';
import { RadarFeed } from '@/components/RadarFeed';
import { CrmPipeline } from '@/components/CrmPipeline';
import { PersonaSettings } from '@/components/PersonaSettings';
import { TelegramSettings } from '@/components/TelegramSettings';
import { PitchModal } from '@/components/PitchModal';
import { PricingModal } from '@/components/PricingModal';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/lib/auth-context';

const DEFAULT_TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: false,
  minScore: 80
};

export default function Home() {
  const { user, profile: userProfile, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'landing' | 'radar' | 'crm' | 'persona' | 'telegram' | 'pricing'>('landing');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(DEFAULT_TELEGRAM_CONFIG);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Authentication Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [pendingTabAfterAuth, setPendingTabAfterAuth] = useState<'radar' | 'crm' | 'persona' | 'telegram'>('radar');

  // Pitch Drawer Modal State
  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<Lead | null>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);

  // Load persisted user preferences & leads on initial mount
  useEffect(() => {
    const savedTelegram = localStorage.getItem('Radarly_telegram');
    if (savedTelegram) {
      try {
        setTelegramConfig(JSON.parse(savedTelegram));
      } catch (e) {}
    }

    // Clear stale cached leads to ensure fresh direct URLs
    localStorage.removeItem('Radarly_leads');
    fetchLeads();
  }, []);

  // When user logs in (e.g. via Google OAuth or form), switch to radar dashboard
  useEffect(() => {
    if (user) {
      setIsAuthModalOpen(false);
      setActiveTab((prev) => (prev === 'landing' ? (pendingTabAfterAuth || 'radar') : prev));
    }
  }, [user, pendingTabAfterAuth]);

  const handleSignOut = async () => {
    await signOut();
    setActiveTab('landing');
  };

  const handleProtectedTabSwitch = (tab: 'landing' | 'radar' | 'crm' | 'persona' | 'telegram' | 'pricing') => {
    if (tab === 'pricing') {
      setIsPricingModalOpen(true);
      return;
    }
    if (tab === 'landing') {
      setActiveTab('landing');
      return;
    }

    // Protect tactical dashboard tabs behind authentication
    if (!user) {
      setPendingTabAfterAuth(tab);
      setAuthMode('signin');
      setIsAuthModalOpen(true);
      return;
    }

    setActiveTab(tab);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signup', targetTab: 'radar' | 'crm' | 'persona' | 'telegram' = 'radar') => {
    setAuthMode(mode);
    setPendingTabAfterAuth(targetTab);
    setIsAuthModalOpen(true);
  };

  // Save leads to localStorage on update
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('Radarly_leads', JSON.stringify(leads));
    }
  }, [leads]);

  const fetchLeads = async (forceRefresh = false) => {
    setIsScanning(true);
    try {
      const savedId = localStorage.getItem('reddit_client_id') || '';
      const savedSecret = localStorage.getItem('reddit_client_secret') || '';
      const queryParams = new URLSearchParams();
      if (savedId) queryParams.set('redditClientId', savedId);
      if (savedSecret) queryParams.set('redditClientSecret', savedSecret);
      if (forceRefresh) queryParams.set('refresh', 'true');

      const url = queryParams.toString() ? `/api/radar/scan?${queryParams.toString()}` : '/api/radar/scan';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLeads((prev) => {
          const statusMap = new Map(prev.map((l) => [l.id, l]));
          const newLeadsMap = new Map<string, Lead>();

          // Add newly scanned leads, preserving existing CRM status & customizations
          for (const newLead of data.leads) {
            const existing = statusMap.get(newLead.id);
            if (existing) {
              newLeadsMap.set(newLead.id, {
                ...newLead,
                status: existing.status,
                dealValue: existing.dealValue,
                generatedPitch: existing.generatedPitch
              });
            } else {
              newLeadsMap.set(newLead.id, newLead);
            }
          }

          // Preserve any existing leads from previous scans
          for (const prevLead of prev) {
            if (!newLeadsMap.has(prevLead.id)) {
              newLeadsMap.set(prevLead.id, prevLead);
            }
          }

          return Array.from(newLeadsMap.values());
        });
      }
    } catch (err) {
      console.error('Failed to scan radar feeds:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleUpdateLeadStatus = (leadId: string, status: Lead['status'], dealValue?: number) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status, dealValue: dealValue ?? l.dealValue } : l))
    );
  };

  const handleMarkContacted = (leadId: string, pitch: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: 'contacted', generatedPitch: pitch } : l))
    );
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const handleOpenPitchModal = (lead: Lead) => {
    setSelectedLeadForPitch(lead);
    setIsPitchModalOpen(true);
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    await updateProfile(newProfile);
  };

  const handleSaveTelegram = (newConfig: TelegramConfig) => {
    setTelegramConfig(newConfig);
    localStorage.setItem('Radarly_telegram', JSON.stringify(newConfig));
  };

  const crmCount = leads.filter((l) => l.status !== 'new').length;

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#0F172A] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleProtectedTabSwitch}
        onRefreshScan={() => fetchLeads(true)}
        isScanning={isScanning}
        leadCount={leads.length}
        crmCount={crmCount}
        userProfileName={user?.name || userProfile.name}
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6">
        {activeTab === 'landing' && (
          <LandingPage
            onEnterApp={() => {
              if (user) {
                setActiveTab('radar');
              } else {
                handleOpenAuth('signup', 'radar');
              }
            }}
            onOpenPricing={() => setIsPricingModalOpen(true)}
          />
        )}

        {activeTab === 'radar' && (
          <RadarFeed
            leads={leads}
            userProfile={userProfile}
            onOpenPitch={handleOpenPitchModal}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onRefreshScan={() => fetchLeads(true)}
            isScanning={isScanning}
          />
        )}

        {activeTab === 'crm' && (
          <CrmPipeline
            leads={leads}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onDeleteLead={handleDeleteLead}
            onOpenPitch={handleOpenPitchModal}
          />
        )}

        {activeTab === 'persona' && (
          <PersonaSettings userProfile={userProfile} onSaveProfile={handleSaveProfile} />
        )}

        {activeTab === 'telegram' && (
          <TelegramSettings config={telegramConfig} onSaveConfig={handleSaveTelegram} />
        )}
      </main>

      {/* AI Pitch Generator Modal Drawer */}
      <PitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        lead={selectedLeadForPitch}
        userProfile={userProfile}
        onMarkContacted={handleMarkContacted}
      />

      {/* Pricing Upgrade Modal */}
      <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />

      {/* Authentication Gate Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (user) {
            setActiveTab(pendingTabAfterAuth || 'radar');
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2">
              <img src="/radarly-logo.png" alt="Radarly AI" className="h-7 w-7 object-contain" />
              <img src="/radarly-wordmark.png" alt="Radarly AI" className="h-5 object-contain" />
              <span className="text-slate-300 ml-1">•</span>
              <span className="text-xs font-normal text-slate-500">Autonomous Client Intent Radar</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Feeds Operational</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">99.98% SLA</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>© 2025 Radarly AI Technologies, Inc. All rights reserved.</div>
            <div className="flex items-center gap-4 text-slate-600">
              <button onClick={() => handleProtectedTabSwitch('persona')} className="hover:text-slate-900 transition-colors cursor-pointer">API Documentation</button>
              <button onClick={() => setIsPricingModalOpen(true)} className="hover:text-slate-900 transition-colors cursor-pointer">Plan Limits</button>
              <button onClick={() => handleProtectedTabSwitch('radar')} className="hover:text-slate-900 transition-colors cursor-pointer">Live Radar</button>
              <button onClick={() => handleProtectedTabSwitch('persona')} className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
