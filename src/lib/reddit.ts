import { Lead } from '@/types';

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

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

export const GIG_SUBREDDITS = [
  'forhire',
  'freelance_for_hire',
  'jobbit',
  'hiring',
  'DesignJobs'
];

export const SAAS_SUBREDDITS = [
  'SaaS',
  'SideProject',
  'shopify',
  'webdev',
  'freelance',
  'smallbusiness'
];

export const ALL_SUBREDDITS = [...GIG_SUBREDDITS, ...SAAS_SUBREDDITS];

// In-memory cache
let cachedLeads: Lead[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function fetchLiveRedditRss(forceRefresh = false): Promise<Lead[]> {
  const now = Date.now();
  if (!forceRefresh && cachedLeads.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedLeads;
  }

  const leads: Lead[] = [];
  const multiSubQuery = ALL_SUBREDDITS.join('+');
  const url = `https://www.reddit.com/r/${multiSubQuery}/.rss?limit=100`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.warn(`Reddit multi-sub fetch returned status:`, res.status);
      return cachedLeads;
    }

    const xml = await res.text();
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = block.match(/<link[^>]+href="([^"]+)"/);
      const authorMatch = block.match(/<name>([^<]+)<\/name>/);
      const contentMatch = block.match(/<content type="html">([\s\S]*?)<\/content>/);
      const updatedMatch = block.match(/<updated>([^<]+)<\/updated>/);

      const rawTitle = titleMatch ? decodeHtml(titleMatch[1]) : '';
      const rawContent = contentMatch ? decodeHtml(contentMatch[1]) : '';
      
      let link = linkMatch ? linkMatch[1] : 'https://www.reddit.com';
      if (link.startsWith('http://')) {
        link = link.replace('http://', 'https://');
      }

      // Robust subreddit extraction directly from post URL
      const subFromLinkMatch = link.match(/reddit\.com\/r\/([^\/]+)/i);
      const actualSub = subFromLinkMatch ? subFromLinkMatch[1].toLowerCase() : 'reddit';

      const author = authorMatch ? authorMatch[1] : 'Reddit User';
      const createdAt = updatedMatch ? updatedMatch[1] : new Date().toISOString();

      if (
        author.toLowerCase() === 'automoderator' ||
        rawTitle.toLowerCase().includes('moderator') ||
        rawTitle.toLowerCase().includes('rules reminder') ||
        rawTitle.toLowerCase().includes('karma requirements') ||
        rawTitle.toLowerCase().includes('weekly thread')
      ) {
        continue;
      }

      const isForHireSeller =
        rawTitle.toLowerCase().includes('[for hire]') || rawTitle.toLowerCase().startsWith('for hire');
      const isHiringBuyer =
        rawTitle.toLowerCase().includes('[hiring]') ||
        rawTitle.toLowerCase().startsWith('hiring') ||
        rawTitle.toLowerCase().includes('looking for') ||
        rawTitle.toLowerCase().includes('need someone') ||
        rawTitle.toLowerCase().includes('hire') ||
        rawTitle.toLowerCase().includes('seeking');

      if (
        ['forhire', 'freelance_for_hire', 'jobbit', 'hiring', 'designjobs'].includes(actualSub) &&
        isForHireSeller &&
        !isHiringBuyer
      ) {
        continue;
      }

      const fullText = `${rawTitle} ${rawContent}`.toLowerCase();
      let score = 55;
      const matchedKeywords: string[] = [`r/${actualSub}`];

      if (isHiringBuyer) {
        score += 30;
        matchedKeywords.push('Verified Hiring');
      }

      if (
        fullText.includes('looking for') ||
        fullText.includes('need developer') ||
        fullText.includes('recommend') ||
        fullText.includes('alternative') ||
        fullText.includes('hire')
      ) {
        score += 15;
        matchedKeywords.push('High Intent');
      }

      const budget = extractBudget(`${rawTitle} ${rawContent}`);
      if (budget) {
        score += 15;
        matchedKeywords.push('Explicit Budget');
      }

      score = Math.min(98, Math.max(40, score));

      // Generate deterministic stable ID from Reddit post ID
      const postIdMatch = link.match(/\/comments\/([a-z0-9]+)/i);
      let uniqueSuffix = postIdMatch ? postIdMatch[1] : '';
      if (!uniqueSuffix) {
        let hash = 0;
        for (let i = 0; i < link.length; i++) {
          hash = (hash << 5) - hash + link.charCodeAt(i);
          hash |= 0;
        }
        uniqueSuffix = Math.abs(hash).toString(36);
      }

      leads.push({
        id: `reddit_${actualSub}_${uniqueSuffix}`,
        title: rawTitle,
        body:
          rawContent.length > 280
            ? rawContent.slice(0, 280) + '...'
            : rawContent || 'Click link to view full Reddit post.',
        author: author.startsWith('/u/') ? author : `/u/${author}`,
        source: 'reddit',
        subreddit: `r/${actualSub}`,
        url: link,
        createdAt,
        intentScore: score,
        urgency: score >= 80 ? 'High' : 'Medium',
        estimatedBudget: budget || (score >= 75 ? '$500 - $2,500+' : 'Negotiable'),
        matchedKeywords: matchedKeywords.length > 0 ? matchedKeywords : ['Social Lead'],
        status: 'new'
      });
    }

    if (leads.length > 0) {
      cachedLeads = leads;
      lastFetchTime = now;
    }
  } catch (err) {
    console.error('All-sub single query error:', err);
  }

  return cachedLeads;
}
