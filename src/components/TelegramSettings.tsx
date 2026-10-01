'use client';

import React, { useState } from 'react';
import { TelegramConfig } from '@/types';
import { Send, Check, AlertCircle, Sparkles, Bell, ExternalLink } from 'lucide-react';

interface TelegramSettingsProps {
  config: TelegramConfig;
  onSaveConfig: (config: TelegramConfig) => void;
}

export function TelegramSettings({ config, onSaveConfig }: TelegramSettingsProps) {
  const [botToken, setBotToken] = useState<string>(config.botToken);
  const [chatId, setChatId] = useState<string>(config.chatId);
  const [enabled, setEnabled] = useState<boolean>(config.enabled);
  const [minScore, setMinScore] = useState<number>(config.minScore || 80);

  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      botToken,
      chatId,
      enabled,
      minScore
    });
    setTestStatus({ success: true, message: 'Settings saved successfully!' });
    setTimeout(() => setTestStatus(null), 3000);
  };

  const handleTestAlert = async () => {
    if (!botToken || !chatId) {
      setTestStatus({ success: false, message: 'Please enter both Bot Token and Chat ID first.' });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);

    try {
      const res = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken,
          chatId,
          isTest: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus({ success: true, message: 'Test alert sent! Check your Telegram app now.' });
      } else {
        setTestStatus({ success: false, message: data.error || 'Failed to send alert. Check token and Chat ID.' });
      }
    } catch (err: any) {
      setTestStatus({ success: false, message: err.message || 'Network error while contacting Telegram.' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-sm">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Telegram Instant Lead Alerts</h2>
            <p className="text-xs text-slate-500">
              Get pinged directly on your phone within 60 seconds whenever a high-budget client posts a gig.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">Enable Telegram Alerts</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Telegram Bot Token</label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Your Telegram Chat ID</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 987654321"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Min Score Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Only notify for leads with Score &ge;</span>
              <span className="font-bold text-indigo-700">{minScore}/100</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Status Message */}
          {testStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              testStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}>
              {testStatus.success ? <Check className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />}
              <span>{testStatus.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleTestAlert}
              disabled={isTesting}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-all"
            >
              <Bell className="h-3.5 w-3.5 text-sky-600" />
              <span>{isTesting ? 'Sending Alert...' : 'Send Test Alert'}</span>
            </button>

            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Save Config</span>
            </button>
          </div>
        </form>

        {/* 3-Minute Setup Guide */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-700 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>3-Minute Free Setup Guide</span>
          </h3>

          <div className="space-y-3 pt-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <div className="font-semibold text-indigo-700">Step 1: Create your free bot</div>
              <p className="text-slate-600 text-[11px]">
                Open Telegram and search for <b className="text-slate-900">@BotFather</b>. Send the message <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900">/newbot</code> and follow instructions to get your <b>Bot Token</b>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <div className="font-semibold text-indigo-700">Step 2: Get your Chat ID</div>
              <p className="text-slate-600 text-[11px]">
                Start a conversation with your new bot, then search <b className="text-slate-900">@userinfobot</b> on Telegram and click Start to get your numeric <b>Chat ID</b>.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <div className="font-semibold text-indigo-700">Step 3: Click "Send Test Alert"</div>
              <p className="text-slate-600 text-[11px]">
                Paste your Token and Chat ID above, then click the test button. You'll receive a live notification on your phone immediately!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
