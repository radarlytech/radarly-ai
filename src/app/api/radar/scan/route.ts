import { NextResponse } from 'next/server';
import { Lead } from '@/types';
import { fetchLiveRedditRss } from '@/lib/reddit';

function extractBudget(text: string): string | undefined {
  const budgetRegexes = [
    /\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|K)?\s*(?:-\s*\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|K)?)?/i,
    /(?:budget|rate|paying|pay|offer|compensation|salary)[:\s]+\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:k|K)?)/i,
    /\$\s?(\d{1,3})\s*(?:hr|\/hr|per hour|hour)/i,
    /(\d{1,3}(?:,\d{3})*)\s*(?:USD|EUR|GBP|dollars)/i
  ];

  for (const regex of budgetRegexes) {
    const match = text.match(regex);
    if (match) {
      return match[0].trim();
    }
  }
  return undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchKeyword = searchParams.get('keyword')?.toLowerCase();
  const requestedSub = searchParams.get('subreddit')?.toLowerCase().replace(/^r\//, '');
  const forceRefresh = searchParams.get('refresh') === 'true';

  const leads: Lead[] = [];

  try {
    // 1. Fetch Real-Time Live Reddit Feeds across all 11+ subreddits
    try {
      const liveRedditLeads = await fetchLiveRedditRss(forceRefresh);
      leads.push(...liveRedditLeads);
    } catch (redditErr) {
      console.warn('Reddit RSS live fetch error:', redditErr);
    }

    // 2. Fetch Genuine 𝕏 (Twitter) Leads scraped via twscrape
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dataFile = path.join(process.cwd(), 'data', 'x_leads.json');
      if (fs.existsSync(dataFile)) {
        const raw = fs.readFileSync(dataFile, 'utf-8');
        const scraped = JSON.parse(raw);
        if (Array.isArray(scraped) && scraped.length > 0) {
          const nowMs = Date.now();
          const genuineScraped = scraped.map((lead: any, idx: number) => ({
            ...lead,
            verifiedBadgeType: lead.verifiedBadgeType || undefined,
            createdAt: lead.createdAt || new Date(nowMs - (idx + 1) * 35 * 60 * 1000).toISOString(),
            source: 'twitter' as const,
            subreddit: '𝕏 (Twitter)'
          }));
          leads.push(...genuineScraped);
        }
      }
    } catch (twErr) {
      console.warn('twscrape data loader error:', twErr);
    }

    // 3. Fetch Genuine LinkedIn Leads (via Agent-Reach & LinkedIn Engine)
    try {
      const fs = await import('fs');
      const path = await import('path');
      const dataFile = path.join(process.cwd(), 'data', 'linkedin_leads.json');
      if (fs.existsSync(dataFile)) {
        const raw = fs.readFileSync(dataFile, 'utf-8');
        const scraped = JSON.parse(raw);
        if (Array.isArray(scraped) && scraped.length > 0) {
          const nowMs = Date.now();
          const genuineScraped = scraped.map((lead: any, idx: number) => ({
            ...lead,
            createdAt: lead.createdAt || new Date(nowMs - (idx + 1) * 35 * 60 * 1000).toISOString(),
            source: 'linkedin' as const,
            subreddit: lead.subreddit || 'LinkedIn Freelance'
          }));
          leads.push(...genuineScraped);
        }
      }
    } catch (liErr) {
      console.warn('LinkedIn data loader error:', liErr);
    }

    try {
      const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json', {
        next: { revalidate: 120 }
      });
      if (hnRes.ok) {
        const jobIds: number[] = await hnRes.json();
        const topIds = jobIds.slice(0, 8);

        for (const id of topIds) {
          const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          if (itemRes.ok) {
            const item = await itemRes.json();
            if (item && item.title) {
              const fullText = `${item.title} ${item.text || ''}`;
              const budget = extractBudget(fullText);

              leads.push({
                id: `hn_${item.id}`,
                title: item.title,
                body: item.text
                  ? item.text.replace(/<[^>]*>?/gm, '').slice(0, 300)
                  : `Hiring opportunity from Y Combinator startup founders. Click link to view direct contact & requirements.`,
                author: item.by || 'YC Founder',
                source: 'forum',
                subreddit: 'Hacker News (YC)',
                url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
                createdAt: new Date(item.time * 1000).toISOString(),
                intentScore: 92,
                urgency: 'High',
                estimatedBudget: budget || '$2,000 - $6,000 / mo',
                matchedKeywords: ['YC Startup', 'Verified Hiring', 'Direct Founder'],
                status: 'new'
              });
            }
          }
        }
      }
    } catch (hnErr) {
      console.warn('HN live fetch error:', hnErr);
    }

    // 4. Fetch Live Remote Contractor Gigs
    try {
      const remoteRes = await fetch('https://remoteok.com/api', {
        headers: { 'User-Agent': 'Radarly/1.0' },
        next: { revalidate: 300 }
      });
      if (remoteRes.ok) {
        const jobs = await remoteRes.json();
        if (Array.isArray(jobs)) {
          const clientGigs = jobs.slice(1, 8);
          for (const gig of clientGigs) {
            if (!gig || !gig.position) continue;

            const tags = Array.isArray(gig.tags) ? gig.tags.slice(0, 4) : [];
            const budget = gig.salary_min && gig.salary_max
              ? `$${(gig.salary_min / 1000).toFixed(0)}k - $${(gig.salary_max / 1000).toFixed(0)}k`
              : (gig.salary || '$1,500 - $4,000+');

            leads.push({
              id: `remote_${gig.id}`,
              title: `[GIG] ${gig.position} at ${gig.company || 'Client'}`,
              body: gig.description
                ? gig.description.replace(/<[^>]*>?/gm, '').slice(0, 280) + '...'
                : `Looking for talent with skills in ${tags.join(', ')}.`,
              author: gig.company || 'Remote Client',
              source: 'forum',
              subreddit: 'Remote Contractor Feed',
              url: gig.url || `https://remoteok.com/remote-jobs/${gig.id}`,
              createdAt: new Date(gig.date || Date.now()).toISOString(),
              intentScore: 88,
              urgency: 'High',
              estimatedBudget: budget,
              matchedKeywords: tags.length > 0 ? tags : ['Contractor', 'Client Gig'],
              status: 'new'
            });
          }
        }
      }
    } catch (remoteErr) {
      console.warn('Remote feed error:', remoteErr);
    }

    // Filter by search keyword if requested via API query param
    let resultLeads = leads;

    if (searchKeyword) {
      resultLeads = resultLeads.filter(
        (l) =>
          l.title.toLowerCase().includes(searchKeyword) ||
          l.body.toLowerCase().includes(searchKeyword) ||
          l.matchedKeywords.some((k) => k.toLowerCase().includes(searchKeyword))
      );
    }

    // Sort by verified checkmark first, then highest intent score, then newest post
    resultLeads.sort((a, b) => {
      if (Boolean(a.isVerified) !== Boolean(b.isVerified)) {
        return a.isVerified ? -1 : 1;
      }
      if (Math.abs(b.intentScore - a.intentScore) >= 5) {
        return b.intentScore - a.intentScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      count: resultLeads.length,
      leads: resultLeads,
      source: 'live_network_feeds'
    });
  } catch (err: any) {
    console.error('Radar Scan API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
