'use client';

import React, { useState } from 'react';
import { Lead, UserProfile } from '@/types';
import {
  Sparkles,
  ExternalLink,
  Filter,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  RefreshCw,
  Bookmark,
  TrendingUp,
  ChevronDown,
  Layers,
  Activity,
  Server,
  Zap,
  ShieldCheck,
  Send,
  MessageSquare,
  Flame,
  BarChart2,
  Compass,
  ArrowUpRight,
  SlidersHorizontal,
  BrainCircuit,
  Target,
  Check,
  Calendar,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RadarFeedProps {
  leads: Lead[];
  userProfile: UserProfile;
  onOpenPitch: (lead: Lead) => void;
  onUpdateLeadStatus: (leadId: string, status: Lead['status'], dealValue?: number) => void;
  onRefreshScan: () => void;
  isScanning: boolean;
}

const SUBREDDIT_OPTIONS = [
  { id: 'all', label: 'All Sources & Subreddits' },
  { id: 'linkedin_freelance', label: 'LinkedIn: Freelancers (Main)' },
  { id: 'linkedin_jobs', label: 'LinkedIn: Direct Jobs (Secondary)' },
  { id: 'twitter', label: '𝕏 (Twitter / X Freelance)' },
  { id: 'hacker news', label: 'Hacker News (YC Startups & Jobs)' },
  { id: 'remote contractor', label: 'Remote Contractor Boards' },
  { id: 'forhire', label: 'r/forhire (Active Gigs)' },
  { id: 'freelance_for_hire', label: 'r/freelance_for_hire' },
  { id: 'jobbit', label: 'r/jobbit' },
  { id: 'hiring', label: 'r/hiring' },
  { id: 'designjobs', label: 'r/DesignJobs' },
  { id: 'saas', label: 'r/SaaS (Founder Inquiries)' },
  { id: 'sideproject', label: 'r/SideProject' },
  { id: 'webdev', label: 'r/webdev' },
  { id: 'shopify', label: 'r/shopify' },
  { id: 'smallbusiness', label: 'r/smallbusiness' },
  { id: 'freelance', label: 'r/freelance' }
];

// Circular Intent Score Component
function CircularProgress({ score }: { score: number }) {
  const radius = 24;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 90) return '#10B981'; // Emerald
    if (s >= 75) return '#2563EB'; // Blue
    if (s >= 60) return '#F59E0B'; // Amber
    return '#94A3B8'; // Slate
  };

  const color = getColor(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
        <circle
          stroke="#E2E8F0"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xs font-black text-slate-900 leading-none">{score}</span>
      </div>
    </div>
  );
}

// Mini Sparkline SVG Component for Metric Cards
function MiniSparkline({ data, color = '#2563EB' }: { data: number[]; color?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 64;
  const height = 24;
  
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function RadarFeed({
  leads,
  userProfile,
  onOpenPitch,
  onUpdateLeadStatus,
  onRefreshScan,
  isScanning
}: RadarFeedProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [budgetFilter, setBudgetFilter] = useState<number>(0);
  const [maxAgeHours, setMaxAgeHours] = useState<number>(0);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [hiringOnly, setHiringOnly] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [hoveredScoreId, setHoveredScoreId] = useState<string | null>(null);
  const now = Date.now();
  const allLeads = leads;

  // Calculate accurate relative time
  const getRelativeTime = (dateStr: string) => {
    try {
      const past = new Date(dateStr).getTime();
      if (isNaN(past)) return 'Recent';
      const diffMs = now - past;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  // Post Type Badge
  const getPostTypeBadge = (lead: Lead) => {
    const titleLower = lead.title.toLowerCase();
    
    if (
      titleLower.includes('[for hire]') ||
      titleLower.startsWith('for hire') ||
      titleLower.includes('for-hire')
    ) {
      return { label: '[FOR HIRE]', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }

    const cleanSub = (lead.subreddit || '').toLowerCase();
    if (cleanSub.includes('linkedin freelance') || (lead.source === 'linkedin' && !cleanSub.includes('job'))) {
      return { label: 'LINKEDIN FREELANCE', color: 'bg-blue-600 text-white border-blue-500 font-bold shadow-2xs' };
    }
    if (cleanSub.includes('linkedin jobs') || (lead.source === 'linkedin' && cleanSub.includes('job'))) {
      return { label: 'LINKEDIN JOB', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold' };
    }
    if (lead.source === 'linkedin') {
      return { label: 'LINKEDIN GIG', color: 'bg-blue-600 text-white border-blue-500 font-bold shadow-2xs' };
    }
    if (lead.source === 'twitter') {
      return { label: '𝕏 FOUNDER', color: 'bg-slate-900 text-white border-slate-800 font-bold' };
    }
    if (lead.subreddit?.toLowerCase().includes('hacker news')) {
      return { label: 'YC HIRING', color: 'bg-orange-50 text-orange-700 border-orange-200 font-bold' };
    }
    if (
      titleLower.includes('[hiring]') ||
      titleLower.startsWith('hiring') ||
      titleLower.includes('looking for') ||
      titleLower.includes('need developer') ||
      titleLower.includes('need engineer') ||
      lead.matchedKeywords.includes('Verified Hiring')
    ) {
      return { label: '[HIRING]', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' };
    }

    return { label: '[OPPORTUNITY]', color: 'bg-blue-50 text-blue-700 border-blue-200' };
  };

  // Urgency Style
  const getUrgencyStyle = (urgency?: string, score?: number) => {
    const isHigh = urgency === 'High' || (score !== undefined && score >= 85);
    const isMedium = urgency === 'Medium' || (score !== undefined && score >= 70 && score < 85);

    if (isHigh) {
      return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    }
    if (isMedium) {
      return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    }
    return 'bg-slate-50 text-slate-600 border-slate-200 font-medium';
  };

  // Budget Style
  const getBudgetStyle = (budget?: string) => {
    if (!budget) return 'text-slate-800 bg-slate-50 border-slate-200';
    const match = budget.match(/\$?\s?(\d{1,3}(?:,\d{3})*)/);
    const val = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
    const isHourly = budget.toLowerCase().includes('hr') || budget.toLowerCase().includes('hour');

    if ((!isHourly && val >= 3000) || (isHourly && val >= 75)) {
      return 'text-emerald-800 bg-emerald-50 border-emerald-300 font-bold shadow-2xs';
    }
    if ((!isHourly && val >= 800) || (isHourly && val >= 35)) {
      return 'text-emerald-700 bg-emerald-50/70 border-emerald-200 font-bold';
    }
    return 'text-blue-700 bg-blue-50/70 border-blue-200 font-semibold';
  };

  // Filter Matching Logic
  const matchesBaseFilters = (lead: Lead) => {
    const matchesSearch =
      searchTerm === '' ||
      lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.matchedKeywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.author && lead.author.toLowerCase().includes(searchTerm.toLowerCase()));

    const cleanSelected = selectedSubreddit.toLowerCase().replace(/^r\//, '');
    const cleanLeadSub = (lead.subreddit || '').toLowerCase().replace(/^r\//, '');

    let matchesChannel = false;
    if (selectedSubreddit === 'all') {
      matchesChannel = true;
    } else if (selectedSubreddit === 'linkedin_freelance') {
      matchesChannel = (lead.source === 'linkedin' || cleanLeadSub.includes('linkedin')) && !cleanLeadSub.includes('job');
    } else if (selectedSubreddit === 'linkedin_jobs') {
      matchesChannel = (lead.source === 'linkedin' || cleanLeadSub.includes('linkedin')) && cleanLeadSub.includes('job');
    } else if (selectedSubreddit === 'linkedin') {
      matchesChannel = lead.source === 'linkedin' || cleanLeadSub.includes('linkedin');
    } else if (selectedSubreddit === 'twitter') {
      matchesChannel =
        lead.source === 'twitter' ||
        cleanLeadSub.includes('twitter') ||
        cleanLeadSub.includes('𝕏') ||
        cleanLeadSub.includes('x');
    } else if (selectedSubreddit === 'hacker news') {
      matchesChannel = cleanLeadSub.includes('hacker news') || cleanLeadSub.includes('yc');
    } else if (selectedSubreddit === 'remote contractor') {
      matchesChannel = cleanLeadSub.includes('remote');
    } else {
      matchesChannel = cleanLeadSub === cleanSelected;
    }

    const matchesScore = lead.intentScore >= minScore;
    const matchesVerified = !verifiedOnly || Boolean(lead.isVerified);

    let matchesHiring = true;
    if (hiringOnly) {
      const badge = getPostTypeBadge(lead);
      matchesHiring = badge.label !== '[FOR HIRE]';
    }

    let matchesBudget = true;
    if (budgetFilter > 0) {
      const match = (lead.estimatedBudget || '').match(/\$?\s?(\d{1,3}(?:,\d{3})*)/);
      const val = match ? parseInt(match[1].replace(/,/g, ''), 10) : 0;
      matchesBudget = val >= budgetFilter;
    }

    return matchesSearch && matchesChannel && matchesScore && matchesVerified && matchesHiring && matchesBudget;
  };

  const baseMatchedLeads = allLeads.filter(matchesBaseFilters);

  // Time window filtering with smart fallback
  let activeLeads = baseMatchedLeads.filter((lead) => {
    if (maxAgeHours === 0) return true;
    const leadTime = new Date(lead.createdAt).getTime();
    const ageHours = (now - leadTime) / (1000 * 60 * 60);
    return ageHours <= maxAgeHours;
  });

  if (activeLeads.length === 0 && baseMatchedLeads.length > 0 && maxAgeHours !== 0) {
    activeLeads = baseMatchedLeads;
  }

  // Sorting: Verified accounts pinned at top, then score, then recency
  const filteredLeads = activeLeads.sort((a, b) => {
    if (Boolean(a.isVerified) !== Boolean(b.isVerified)) {
      return a.isVerified ? -1 : 1;
    }
    if (Math.abs(b.intentScore - a.intentScore) >= 5) {
      return b.intentScore - a.intentScore;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const estimatedPipeline = filteredLeads.reduce((acc, lead) => {
    const rawBudget = lead.estimatedBudget || '';
    const match = rawBudget.match(/\$?\s?(\d{1,3}(?:,\d{3})*)/);
    if (match) {
      const num = parseInt(match[1].replace(/,/g, ''), 10);
      return acc + (isNaN(num) ? 1500 : num);
    }
    return acc + 1500;
  }, 0);

  const highUrgencyCount = filteredLeads.filter((l) => l.urgency === 'High' || l.intentScore >= 85).length;
  const highUrgencyPercent = filteredLeads.length > 0 ? Math.round((highUrgencyCount / filteredLeads.length) * 100) : 0;
  const newTodayCount = filteredLeads.filter((l) => (now - new Date(l.createdAt).getTime()) <= 24 * 60 * 60 * 1000).length;

  const getInitials = (author: string) => {
    const clean = author.replace(/^@/, '').replace(/^\/u\//, '');
    return clean.slice(0, 2).toUpperCase() || 'SD';
  };

  const currentSourceLabel = SUBREDDIT_OPTIONS.find((o) => o.id === selectedSubreddit)?.label || 'All Sources';

  return (
    <div className="space-y-6 text-[#0F172A] antialiased max-w-[1440px] mx-auto">
      {/* Top Hero Banner / Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Live Intent Radar
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              {filteredLeads.length} Live Opportunities
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Real-time hiring intent harvested across 𝕏 (Twitter), Reddit, and Hacker News YC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefreshScan}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 text-xs font-bold text-white transition-all shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
            title="Scan for fresh leads across all feeds"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? 'animate-spin text-white' : 'text-white'}`} />
            <span>{isScanning ? 'Syncing Feeds...' : 'Sync Feeds'}</span>
          </button>
        </div>
      </div>

      {/* 5 Hero Metric Overview Cards (Bento Style Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Total Opportunities */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="h-3 w-3" />
              <span>+18%</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Total Opportunities</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{filteredLeads.length}</div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Active channels</span>
            <MiniSparkline data={[12, 14, 18, 16, 22, 25, filteredLeads.length]} color="#2563EB" />
          </div>
        </div>

        {/* Card 2: Total Pipeline Value */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <DollarSign className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <TrendingUp className="h-3 w-3" />
              <span>+24%</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Pipeline Value</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              ${estimatedPipeline >= 1000 ? `${(estimatedPipeline / 1000).toFixed(1)}k` : estimatedPipeline.toLocaleString()}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Est. contract volume</span>
            <MiniSparkline data={[180, 210, 240, 220, 260, 290, estimatedPipeline / 1000]} color="#10B981" />
          </div>
        </div>

        {/* Card 3: High Intent Leads */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
              <span>{highUrgencyPercent}% Ratio</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">High Intent Intercepts</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{highUrgencyCount}</div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Score ≥ 85 signals</span>
            <MiniSparkline data={[10, 15, 14, 18, 20, 22, highUrgencyCount]} color="#8B5CF6" />
          </div>
        </div>

        {/* Card 4: Response Rate Benchmark */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Activity className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              <span>4.2x Industry</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Response Rate</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">42.8%</div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
            <span>AI tailored pitches</span>
            <MiniSparkline data={[28, 32, 35, 38, 40, 42, 43]} color="#4F46E5" />
          </div>
        </div>

        {/* Card 5: New Today */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Zap className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span>Streaming</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">New Today</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{newTodayCount}</div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
            <span>Last 24h intake</span>
            <MiniSparkline data={[8, 12, 16, 20, 18, 24, newTodayCount]} color="#0284C7" />
          </div>
        </div>
      </div>

      {/* Modern Command-Bar Search & Smart Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Linear/Raycast-Inspired Command Search */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search opportunities, founders, technologies, budgets..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-12 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-200 shadow-2xs">
              ⌘K
            </span>
          </div>

          {/* Subreddit / Platform Dropdown */}
          <div className="md:col-span-4 relative">
            <select
              value={selectedSubreddit}
              onChange={(e) => setSelectedSubreddit(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all cursor-pointer pr-9"
            >
              {SUBREDDIT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Quick Channel Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Feeds' },
            { id: 'linkedin_freelance', label: 'LinkedIn (Freelancers)' },
            { id: 'linkedin_jobs', label: 'LinkedIn (Jobs)' },
            { id: 'twitter', label: '𝕏 (Twitter)' },
            { id: 'forhire', label: 'r/forhire' },
            { id: 'hacker news', label: 'Hacker News YC' },
            { id: 'designjobs', label: 'r/DesignJobs' },
            { id: 'saas', label: 'r/SaaS' },
            { id: 'remote contractor', label: 'Remote Gigs' }
          ].map((pill) => {
            const isActive = selectedSubreddit === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedSubreddit(pill.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-transparent'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Smart Filter Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setHiringOnly(!hiringOnly)}
              className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-all border cursor-pointer ${
                hiringOnly
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              [HIRING] Posts Only
            </button>

            <button
              onClick={() => setMinScore(minScore === 85 ? 0 : 85)}
              className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all border cursor-pointer ${
                minScore === 85
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              Score: 85+ Intent
            </button>

            <button
              onClick={() => setBudgetFilter(budgetFilter === 1000 ? 0 : 1000)}
              className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all border cursor-pointer ${
                budgetFilter === 1000
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              $1,000+ Budget
            </button>

            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-all border cursor-pointer ${
                verifiedOnly
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              Verified Only
            </button>

            <button
              onClick={() => setMaxAgeHours(maxAgeHours === 24 ? 0 : 24)}
              className={`rounded-lg px-3 py-1 text-[11px] font-medium transition-all border cursor-pointer ${
                maxAgeHours === 24
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
              }`}
            >
              Last 24 Hours
            </button>
          </div>

          <div className="text-[11px] text-[#64748B] font-medium">
            Displaying <b className="text-slate-900 font-bold">{filteredLeads.length}</b> intercepted leads
          </div>
        </div>
      </div>

      {/* Opportunity Cards Stream */}
      <div className="space-y-4">
        {filteredLeads.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-12 text-center space-y-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <Filter className="h-10 w-10 text-slate-400 mx-auto" />
            <div className="text-base font-bold text-slate-800">No client leads match your active filters</div>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">
              Try selecting "All Sources", clearing your search query, or clicking Sync Feeds to refresh the radar.
            </p>
            <button
              onClick={() => {
                setSelectedSubreddit('all');
                setSearchTerm('');
                setMinScore(0);
                setBudgetFilter(0);
                setMaxAgeHours(0);
                setVerifiedOnly(false);
                setHiringOnly(false);
              }}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const isBookmarked = bookmarkedIds.has(lead.id);
            const badge = getPostTypeBadge(lead);
            const relativeTime = getRelativeTime(lead.createdAt);
            const isExpanded = expandedInsightId === lead.id;
            const isHoveredScore = hoveredScoreId === lead.id;

            return (
              <div
                key={lead.id}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 transition-all duration-200 hover:border-blue-400/80 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-4"
              >
                {/* 3-Column Header: Left (Founder) | Center (Tags) | Right (Score & Budget) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border-b border-slate-100 pb-4">
                  {/* Left Column: Founder Avatar & Identification */}
                  <div className="md:col-span-4 flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {getInitials(lead.author || 'SD')}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {lead.author || 'Hiring Client'}
                        </span>

                        {lead.isVerified && (
                          <span
                            className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-black ${
                              lead.verifiedBadgeType === 'gold'
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-blue-500 text-white'
                            }`}
                            title="Verified Client Account"
                          >
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 truncate">
                          {lead.source === 'twitter' ? '𝕏 (Twitter)' : lead.subreddit || 'Reddit'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center Column: Relative Timestamp & Channel Details */}
                  <div className="md:col-span-4 flex md:justify-center items-center">
                    <div className="flex items-center gap-2 text-xs text-[#64748B] bg-slate-50 border border-slate-200/70 px-3 py-1.5 rounded-xl">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{relativeTime}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Circular Intent Gauge & Prominent Budget */}
                  <div className="md:col-span-4 flex items-center justify-end gap-3 relative">
                    {/* Visual Circular Progress Gauge with Tooltip */}
                    <div
                      className="relative cursor-pointer"
                      onMouseEnter={() => setHoveredScoreId(lead.id)}
                      onMouseLeave={() => setHoveredScoreId(null)}
                    >
                      <div className="flex items-center gap-2">
                        <CircularProgress score={lead.intentScore} />
                        <div className="text-right">
                          <div className="text-[11px] font-black text-slate-900">
                            {lead.intentScore >= 85 ? 'High Probability' : 'Qualified Lead'}
                          </div>
                          <div className="text-[10px] text-[#64748B]">Intent Score</div>
                        </div>
                      </div>

                      {/* Tooltip on Hover */}
                      {isHoveredScore && (
                        <div className="absolute right-0 top-12 z-30 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between">
                            <span>Score Breakdown</span>
                            <span className="text-blue-600">{lead.intentScore}/100</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-600">
                            <span>Hiring Signal</span>
                            <span className="font-semibold text-emerald-600">98%</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-600">
                            <span>Budget Mention</span>
                            <span className="font-semibold text-blue-600">{lead.estimatedBudget ? 'Yes' : 'Negotiable'}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-600">
                            <span>Founder Verified</span>
                            <span className="font-semibold text-indigo-600">{lead.isVerified ? 'Verified ✓' : 'Standard'}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-600">
                            <span>Urgency Level</span>
                            <span className="font-semibold text-rose-600">{lead.urgency}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prominent Budget Range */}
                    {lead.estimatedBudget && (
                      <div className={`text-xs sm:text-sm px-3 py-1.5 rounded-xl border ${getBudgetStyle(lead.estimatedBudget)}`}>
                        {lead.estimatedBudget}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lead Title & Body Quote Box */}
                <div className="space-y-2.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {lead.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-[#FAFBFC] p-4 rounded-2xl border border-slate-200/80 font-normal">
                    “{lead.body}”
                  </div>
                </div>

                {/* Tags & AI Insights Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {lead.matchedKeywords.slice(0, 6).map((keyword, kidx) => (
                      <span
                        key={kidx}
                        className="rounded-lg bg-slate-100/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200/70"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setExpandedInsightId(isExpanded ? null : lead.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      isExpanded
                        ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-2xs'
                        : 'bg-slate-50 text-[#64748B] hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <BrainCircuit className="h-3.5 w-3.5 text-purple-600" />
                    <span>{isExpanded ? 'Hide AI Insights' : 'AI Pitch Angle'}</span>
                  </button>
                </div>

                {/* Dedicated Expandable AI Insights Panel */}
                {isExpanded && (
                  <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-r from-purple-50/50 via-indigo-50/30 to-blue-50/50 p-4 text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between font-bold text-purple-900">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-purple-600" />
                        <span>AI Opportunity Analysis & Pitch Intelligence</span>
                      </div>
                      <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        Estimated Response: <b>48%</b>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      <div className="rounded-xl bg-white/90 p-3 border border-purple-100 shadow-2xs">
                        <div className="font-semibold text-slate-900 mb-1">Opportunity Summary</div>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">
                          Founder looking to hire quickly for full-stack engineering with verified budget allocation.
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/90 p-3 border border-purple-100 shadow-2xs">
                        <div className="font-semibold text-slate-900 mb-1">Recommended Angle</div>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">
                          Offer a 5-minute video audit of their architecture and showcase 1 direct portfolio case study.
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/90 p-3 border border-purple-100 shadow-2xs">
                        <div className="font-semibold text-slate-900 mb-1">Suggested Follow-Up Time</div>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Within 15 minutes for maximum reply conversion rate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons: View Post | Draft Pitch | Save Lead | Move to CRM */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* Left: Quick CRM Stage Switcher */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-[#64748B]">CRM Stage:</span>
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as Lead['status'])}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="new">New Lead</option>
                      <option value="researching">Researching</option>
                      <option value="pitch_sent">Pitch Sent</option>
                      <option value="follow_up">Follow Up</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="won">Won Deal</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  {/* Right: Primary Action Buttons */}
                  <div className="flex items-center gap-2.5">
                    {/* External Link */}
                    <a
                      href={lead.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all shadow-2xs cursor-pointer"
                      title="Open original post in a new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      <span>Open Source Post</span>
                    </a>

                    {/* Bookmark */}
                    <button
                      onClick={(e) => toggleBookmark(lead.id, e)}
                      className={`rounded-xl p-2 text-xs border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'border-amber-300 bg-amber-50 text-amber-600'
                          : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                      title={isBookmarked ? 'Bookmarked' : 'Save Lead'}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>

                    {/* Prominent Linear/Stripe-Style Draft Pitch Button */}
                    <button
                      onClick={() => onOpenPitch(lead)}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Draft Pitch</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
