'use client';

import React, { useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { User, Sparkles, Check, Save, Plus, X, Globe, Clock, Key, ShieldCheck } from 'lucide-react';

interface PersonaSettingsProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export function PersonaSettings({ userProfile, onSaveProfile }: PersonaSettingsProps) {
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [newSkill, setNewSkill] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // 𝕏 Handle & Preferences
  const [twitterHandle, setTwitterHandle] = useState<string>('');

  // Reddit API Credentials
  const [redditClientId, setRedditClientId] = useState<string>('');
  const [redditClientSecret, setRedditClientSecret] = useState<string>('');

  useEffect(() => {
    const savedId = localStorage.getItem('reddit_client_id') || '';
    const savedSecret = localStorage.getItem('reddit_client_secret') || '';
    const savedTwitter = localStorage.getItem('twitter_handle') || '';
    setRedditClientId(savedId);
    setRedditClientSecret(savedSecret);
    setTwitterHandle(savedTwitter);
  }, []);

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    localStorage.setItem('reddit_client_id', redditClientId);
    localStorage.setItem('reddit_client_secret', redditClientSecret);
    localStorage.setItem('twitter_handle', twitterHandle);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Offer, Skills & Platform Radar</h2>
            <p className="text-xs text-slate-500">
              Personalize your AI pitch drafts, configure your 𝕏 (Twitter) handle, and connect your free Reddit OAuth credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          {/* Name & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Your Name / Handle</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="e.g. Alex"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Your Main Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="e.g. Full-Stack Developer"
              />
            </div>
          </div>

          {/* Portfolio & Turnaround */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Globe className="h-3 w-3 text-indigo-600" /> Portfolio / GitHub URL
              </label>
              <input
                type="url"
                value={profile.portfolioUrl}
                onChange={(e) => setProfile({ ...profile, portfolioUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="https://github.com/username"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" /> Typical Turnaround
              </label>
              <input
                type="text"
                value={profile.turnaround}
                onChange={(e) => setProfile({ ...profile, turnaround: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="e.g. 3-5 days"
              />
            </div>
          </div>

          {/* 𝕏 (Twitter) Radar Settings */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="font-bold text-sm text-slate-900">𝕏</span> Your 𝕏 (Twitter) Handle
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">@</span>
              <input
                type="text"
                value={twitterHandle.replace(/^@/, '')}
                onChange={(e) => setTwitterHandle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
                placeholder="username"
              />
            </div>
            <p className="text-[10px] text-slate-500">Used for 1-click DM invites and personalized 𝕏 reply pitches.</p>
          </div>

          {/* Core Skills Tags */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700">Your Core Skills & Technologies</label>
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl border border-slate-200 bg-slate-50">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 rounded-lg bg-indigo-100/70 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-indigo-500 hover:text-indigo-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill (e.g. Next.js, Supabase, Tailwind, Python)..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Reddit OAuth Integration (Optional) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
              <Key className="h-3.5 w-3.5" />
              <span>Direct Reddit API Integration (Optional)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={redditClientId}
                onChange={(e) => setRedditClientId(e.target.value)}
                placeholder="Reddit Client ID"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-mono"
              />
              <input
                type="password"
                value={redditClientSecret}
                onChange={(e) => setRedditClientSecret(e.target.value)}
                placeholder="Reddit Client Secret"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none font-mono"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Free in 10s at <a href="https://reddit.com/prefs/apps" target="_blank" className="text-orange-600 underline font-medium">reddit.com/prefs/apps</a> (Select "script").
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition-all"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span>Settings Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Persona & Platform Settings</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Preview Card */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <Sparkles className="h-4 w-4" />
              <span>Live Pitch Persona Preview</span>
            </div>

            {/* Reddit Preview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2 text-slate-700 leading-relaxed shadow-xs">
              <p className="text-orange-700 text-[11px] font-mono font-semibold">// Reddit / Forum Direct Pitch:</p>
              <p>
                "Hey! Saw your post looking for a developer. I'm a <b>{profile.role || 'Full-Stack Developer'}</b> specializing in{' '}
                <b>{profile.skills.length > 0 ? profile.skills.slice(0, 3).join(', ') : 'Next.js & Supabase'}</b>.
              </p>
              <p>
                I can get this built cleanly with a quick <b>{profile.turnaround || '3-5 days'}</b> turnaround. You can check out my live work here:{' '}
                <span className="text-indigo-600 underline font-medium">{profile.portfolioUrl || 'https://github.com/yourhandle'}</span>.
              </p>
            </div>

            {/* 𝕏 Twitter Preview */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2 text-slate-700 leading-relaxed shadow-xs">
              <p className="text-slate-800 text-[11px] font-mono font-semibold flex items-center gap-1">
                <span className="font-bold">𝕏</span> Quick Reply (&lt; 280 chars):
              </p>
              <p className="italic text-slate-600">
                "Hey! I specialize in {profile.skills[0] || 'Next.js'} & {profile.skills[1] || 'TypeScript'} builds ({profile.turnaround || '3-5 days'} turnaround). Check live work: {profile.portfolioUrl || 'https://github.com/yourhandle'} — let's connect!"
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-3 text-[11px] text-indigo-900">
            <b>Pro Tip:</b> Replying to 𝕏 hiring tweets within the first <b>15 minutes</b> increases direct message conversion rates by over <b>300%</b>.
          </div>
        </div>
      </div>
    </div>
  );
}
