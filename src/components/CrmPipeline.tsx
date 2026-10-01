'use client';

import React, { useState } from 'react';
import { Lead } from '@/types';
import {
  Trophy,
  ArrowRight,
  DollarSign,
  Clock,
  ExternalLink,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Download,
  TrendingUp,
  Sparkles,
  Layers,
  Search,
  UserCheck,
  Send,
  MessageSquare,
  BadgeDollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CrmPipelineProps {
  leads: Lead[];
  onUpdateLeadStatus: (leadId: string, status: Lead['status'], dealValue?: number) => void;
  onOpenPitch: (lead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

const KANBAN_STAGES: {
  id: Lead['status'];
  title: string;
  dotColor: string;
  badgeColor: string;
  borderColor: string;
}[] = [
  { id: 'new', title: 'New Leads', dotColor: 'bg-blue-500', badgeColor: 'bg-blue-50 text-blue-700', borderColor: 'border-slate-200' },
  { id: 'researching', title: 'Researching', dotColor: 'bg-indigo-500', badgeColor: 'bg-indigo-50 text-indigo-700', borderColor: 'border-slate-200' },
  { id: 'pitch_sent', title: 'Pitch Sent', dotColor: 'bg-purple-500', badgeColor: 'bg-purple-50 text-purple-700', borderColor: 'border-slate-200' },
  { id: 'follow_up', title: 'Follow Up', dotColor: 'bg-amber-500', badgeColor: 'bg-amber-50 text-amber-700', borderColor: 'border-slate-200' },
  { id: 'negotiation', title: 'Negotiation', dotColor: 'bg-sky-500', badgeColor: 'bg-sky-50 text-sky-700', borderColor: 'border-slate-200' },
  { id: 'won', title: 'Won', dotColor: 'bg-emerald-500', badgeColor: 'bg-emerald-50 text-emerald-700', borderColor: 'border-emerald-300' }
];

export function CrmPipeline({
  leads,
  onUpdateLeadStatus,
  onOpenPitch,
  onDeleteLead
}: CrmPipelineProps) {
  const [editingValueId, setEditingValueId] = useState<string | null>(null);
  const [dealValueInput, setDealValueInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map legacy statuses to standard Kanban stages if present
  const normalizeStatus = (status: Lead['status']): Lead['status'] => {
    if (status === 'contacted') return 'pitch_sent';
    if (status === 'replied') return 'follow_up';
    if (status === 'proposal_sent') return 'negotiation';
    return status;
  };

  // Calculate CRM metrics
  const wonLeads = leads.filter((l) => l.status === 'won');
  const wonRevenue = wonLeads.reduce((sum, l) => sum + (l.dealValue || 1500), 0);
  const inPipelineLeads = leads.filter((l) => l.status !== 'lost' && l.status !== 'won');
  const pipelineVolume = inPipelineLeads.reduce((sum, l) => sum + (l.dealValue || 1500), 0);
  const winRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;

  const handleMoveStatus = (lead: Lead, newStatus: Lead['status']) => {
    if (newStatus === 'won') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 }
      });
    }
    onUpdateLeadStatus(lead.id, newStatus);
  };

  const handleSaveDealValue = (leadId: string) => {
    const val = parseFloat(dealValueInput);
    if (!isNaN(val)) {
      onUpdateLeadStatus(leadId, leads.find((l) => l.id === leadId)?.status || 'new', val);
    }
    setEditingValueId(null);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Title', 'Author', 'Channel', 'Stage', 'Deal Value ($)', 'Budget', 'URL'];
    const rows = leads.map((l) => [
      l.id,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${(l.author || '').replace(/"/g, '""')}"`,
      `"${l.subreddit || l.source}"`,
      l.status,
      l.dealValue || 1500,
      `"${l.estimatedBudget || ''}"`,
      `"${l.url}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Radarly_deals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(
    (l) =>
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.author && l.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-[#0F172A] antialiased max-w-[1440px] mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            CRM Opportunity Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track, nurture, and close inbound freelance clients from initial discovery to won revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer"
            title="Export all deals to CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* CRM Summary KPI Bento Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Active Deals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Active Pipeline</span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{inPipelineLeads.length} Deals</div>
            <div className="mt-0.5 text-xs text-blue-600 font-medium">${pipelineVolume.toLocaleString()} active volume</div>
          </div>
        </div>

        {/* Card 2: Won Closed Revenue */}
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/70 to-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Won Revenue Closed</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <BadgeDollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-emerald-700">${wonRevenue.toLocaleString()}</div>
            <div className="mt-0.5 text-xs text-emerald-700 font-medium">{wonLeads.length} deals successfully closed</div>
          </div>
        </div>

        {/* Card 3: Win Conversion Rate */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Win Conversion Rate</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900">{winRate}%</div>
            <div className="mt-0.5 text-xs text-[#64748B]">From discovered leads to closed deals</div>
          </div>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3.5 items-start">
        {KANBAN_STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => normalizeStatus(l.status) === stage.id);
          const stageValue = stageLeads.reduce((acc, l) => acc + (l.dealValue || 1500), 0);

          return (
            <div
              key={stage.id}
              className="rounded-2xl border border-slate-200/90 bg-[#FAFBFC] p-3.5 min-h-[520px] flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${stage.dotColor}`} />
                  <span className="text-xs font-bold text-slate-900">{stage.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs">
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              {/* Cards in this column */}
              <div className="space-y-2.5 flex-1">
                {stageLeads.length === 0 ? (
                  <div className="h-28 rounded-xl border border-dashed border-slate-300/80 flex items-center justify-center text-center p-2">
                    <span className="text-[11px] text-[#64748B]">No leads in this stage</span>
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="group rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:border-slate-300 transition-all space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[100px]">
                          {lead.source === 'twitter' ? '𝕏 (Twitter)' : lead.subreddit || 'Reddit'}
                        </span>
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                          {lead.estimatedBudget || '$500+'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug">
                        {lead.title}
                      </h4>

                      <div className="text-[11px] text-[#64748B] truncate">
                        {lead.author || 'Hiring Client'}
                      </div>

                      {/* Deal Value Editor */}
                      <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-slate-100">
                        {editingValueId === lead.id ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">$</span>
                            <input
                              type="number"
                              value={dealValueInput}
                              onChange={(e) => setDealValueInput(e.target.value)}
                              className="w-16 rounded bg-white px-1.5 py-0.5 text-xs text-slate-900 border border-blue-500 focus:outline-none"
                              placeholder="Value"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveDealValue(lead.id)}
                              className="text-[10px] text-emerald-700 font-bold hover:underline"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingValueId(lead.id);
                              setDealValueInput(lead.dealValue?.toString() || '1500');
                            }}
                            className="cursor-pointer hover:text-slate-900 flex items-center gap-1 font-medium"
                            title="Click to set custom deal value"
                          >
                            <DollarSign className="h-3 w-3 text-emerald-600" />
                            <span>Value: <b>${lead.dealValue || 1500}</b></span>
                          </div>
                        )}
                      </div>

                      {/* Stage Move Controls & Action Buttons */}
                      <div className="pt-1.5 flex items-center justify-between gap-1.5">
                        <select
                          value={normalizeStatus(lead.status)}
                          onChange={(e) => handleMoveStatus(lead, e.target.value as Lead['status'])}
                          className="w-full rounded-lg bg-slate-50 border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="new">New Lead</option>
                          <option value="researching">Researching</option>
                          <option value="pitch_sent">Pitch Sent</option>
                          <option value="follow_up">Follow Up</option>
                          <option value="negotiation">Negotiation</option>
                          <option value="won">Won Deal</option>
                          <option value="lost">Lost</option>
                        </select>

                        <button
                          onClick={() => onOpenPitch(lead)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-colors"
                          title="Draft AI Pitch"
                        >
                          <Sparkles className="h-3 w-3" />
                        </button>

                        <a
                          href={lead.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                          title="Open Post"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
