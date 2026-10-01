export interface Lead {
  id: string;
  title: string;
  body: string;
  author: string;
  source: 'reddit' | 'twitter' | 'forum' | 'linkedin';
  subreddit?: string;
  url: string;
  createdAt: string;
  intentScore: number; // 0 - 100
  urgency: 'High' | 'Medium' | 'Low';
  estimatedBudget?: string;
  matchedKeywords: string[];
  status: 'new' | 'researching' | 'pitch_sent' | 'follow_up' | 'negotiation' | 'won' | 'lost' | 'contacted' | 'replied' | 'proposal_sent';
  notes?: string;
  dealValue?: number;
  generatedPitch?: string;
  isVerified?: boolean;
  verifiedBadgeType?: 'blue' | 'gold' | 'verified';
}

export interface UserProfile {
  name: string;
  role: string;
  skills: string[];
  portfolioUrl: string;
  turnaround: string;
  pricingAnchor: string;
  customPitchInstructions: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  minScore: number;
}

export interface RadarFilter {
  keywords: string[];
  subreddits: string[];
  excludeKeywords: string[];
  minScore: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  plan: 'free' | 'pro' | 'founder';
  createdAt: string;
}

