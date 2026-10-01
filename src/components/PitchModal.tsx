'use client';

import React, { useState, useEffect } from 'react';
import { Lead, UserProfile } from '@/types';
import { X, Sparkles, Copy, Check, ExternalLink, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { getTwitterIntentUrl } from '@/lib/twitter';

interface PitchModalProps {
  lead: Lead | null;
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onMarkContacted: (leadId: string, pitch: string) => void;
}

export function PitchModal({
  lead,
  userProfile,
  isOpen,
  onClose,
  onMarkContacted
}: PitchModalProps) {
  const [tone, setTone] = useState<'friendly' | 'confident' | 'consultative' | 'direct'>('friendly');
  const [pitch, setPitch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (lead && isOpen) {
      generatePitch(tone);
    }
  }, [lead, isOpen]);

  const generatePitch = async (selectedTone: 'friendly' | 'confident' | 'consultative' | 'direct') => {
    if (!lead) return;
    setIsLoading(true);
    setIsCopied(false);

    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, userProfile, tone: selectedTone })
      });

      const data = await res.json();
      if (data.success && data.pitch) {
        setPitch(data.pitch);
      }
    } catch (err) {
      console.error('Failed to generate pitch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToneChange = (newTone: 'friendly' | 'confident' | 'consultative' | 'direct') => {
    setTone(newTone);
    generatePitch(newTone);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pitch);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleCopyAndContact = () => {
    handleCopy();
    if (lead) {
      onMarkContacted(lead.id, pitch);
      setTimeout(() => {
        if (lead.source === 'twitter') {
          const intentUrl = getTwitterIntentUrl(lead, pitch);
          window.open(intentUrl, '_blank');
        } else {
          window.open(lead.url, '_blank');
        }
      }, 300);
    }
  };

  if (!isOpen || !lead) return null;

  const isTwitter = lead.source === 'twitter';
  const charCount = pitch.length;
  const isOverTwitterLimit = isTwitter && charCount > 280;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isTwitter ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {isTwitter ? (
                <span className="font-bold text-sm">𝕏</span>
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">AI Pitch Drafter</h3>
                {isTwitter && (
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                    𝕏 Quick Reply Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Tailored to your skills & optimized for high response rates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-4">
          {/* Target Lead Context Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-700 flex items-center gap-1">
                {isTwitter && <span className="font-bold text-slate-900">𝕏</span>}
                {lead.subreddit || (isTwitter ? '𝕏 (Twitter)' : 'Reddit')}
              </span>
              <span className="font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                {lead.estimatedBudget || 'Budget Negotiable'}
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{lead.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-3 italic">"{lead.body}"</p>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Select Pitch Tone:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'friendly', label: 'Friendly & Casual' },
                { id: 'consultative', label: 'Expert / Insight' },
                { id: 'confident', label: 'Fast Turnaround' },
                { id: 'direct', label: 'Direct Bullets' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleToneChange(t.id as any)}
                  disabled={isLoading}
                  className={`rounded-lg py-1.5 text-xs font-medium border transition-all ${
                    tone === t.id
                      ? 'border-indigo-600 bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Generated Pitch Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">Generated Pitch (Editable):</label>
                {isTwitter && (
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                    isOverTwitterLimit
                      ? 'border-rose-300 bg-rose-50 text-rose-700 font-bold'
                      : 'border-slate-200 bg-slate-100 text-slate-700'
                  }`}>
                    {charCount}/280 chars {isOverTwitterLimit && '(Over 𝕏 tweet limit!)'}
                  </span>
                )}
              </div>
              <button
                onClick={() => generatePitch(tone)}
                disabled={isLoading}
                className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            {isLoading ? (
              <div className="h-44 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500">Crafting personalized pitch using Gemini AI...</p>
              </div>
            ) : (
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                rows={isTwitter ? 5 : 7}
                className={`w-full rounded-xl border bg-slate-50/80 p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 leading-relaxed ${
                  isOverTwitterLimit
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                placeholder="AI is generating your pitch..."
              />
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50/80">
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open {isTwitter ? '𝕏 Tweet' : 'Original Post'}</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-xs"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyAndContact}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-all ${
                isTwitter
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
              }`}
            >
              {isTwitter ? (
                <>
                  <span className="font-bold text-sm">𝕏</span>
                  <span>1-Click Reply & Open CRM</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Copy & Open Post (CRM Updated)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
