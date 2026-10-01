import asyncio
import json
import os
import re
import sys
from datetime import datetime

try:
    from twscrape import API, AccountsPool
except ImportError:
    print("twscrape not installed. Run 'pip install twscrape'")
    sys.exit(1)

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'x_leads.json')

# 1. Reject Advice / Guru / Personal Story / Opinion Tweets (Not a client hiring)
ADVICE_AND_STORY_EXCLUSIONS = [
    'tips for', 'how to', 'how i ', 'guide to', 'mindset', 'my girlfriend',
    'my boyfriend', 'my wife', 'my husband', 'story time', 'years ago',
    'thread 🧵', '🧵', "here's why", 'here is why', 'lesson learned', 'advice for',
    "don't do this", 'stop doing', 'secret to', 'cheat code', 'framework:',
    'case study:', 'breakdown:', 'unpopular opinion:', 'make your sample',
    'make your portfolio', 'tips on', 'retweet if', 'follow me for',
    'i make $', 'i earn $', 'makes $', 'salary of $', 'pays about $'
]

# 2. Reject Corporate HR Listings (Degrees, full-time contracts, resumes)
CORPORATE_JOB_EXCLUSIONS = [
    'full-time', 'full time', "bachelor's", 'bachelor degree', 'role summary',
    'key responsibilities', 'job summary', 'send cv', 'send your cv', 'send resume',
    'submit your resume', 'submit resume', 'cover letter', 'on-site', 'onsite',
    'years of experience', 'years experience', '5+ years', '3-5 years',
    'recruiting for our client', 'job title:', 'application deadline:', 'qualifications:'
]

# 3. Reject Seller / Freelancer Self-Promotions & Spammers
SPAM_SELLER_PHRASES = [
    'hmu if', 'hmu for', 'unlimited revision', 'unlimited revisions', 'dm to order',
    'dm me to order', 'commissions open', 'open for commission', 'commission open',
    'my commission', 'i can make', 'i do/make', 'i will design', 'i will build',
    'hire me', 'for hire', 'available for work', 'book your slot', 'slot available',
    'sub badges', 'emotes', 'stream revamp', 'twitch packages', 'kick/twitch',
    'overlays', 'intro/outro', 'gfx artist', 'graphic designer available',
    'rt for', 'discount on', 'dm to buy', 'dm for prices', 'cheap price', 'affordable rate'
]

# 4. Require Explicit Direct Client Hiring / Seeking Signals
CLIENT_HIRING_SIGNALS = [
    'looking for a freelance', 'hiring a freelance', 'need a freelance',
    'looking for a developer', 'looking for a designer', 'looking for someone to build',
    'need someone to build', 'who can build me', 'who can build a', 'can someone build',
    'seeking a developer', 'seeking a designer', 'seeking a freelancer',
    'dm with portfolio', 'reply with portfolio', 'send portfolio', 'drop your portfolio',
    'paying $', 'budget ready', 'budget is $', 'rate is $', 'hourly rate of $',
    'anyone know a good developer', 'anyone know a good designer', 'anyone build me',
    'want to hire someone to', 'need a dev to build', 'need a designer to design'
]

def extract_client_budget(text: str):
    """
    Only extracts budget if directly attached to client payment keywords (budget, paying, rate, etc.).
    Rejects annual salary contexts like $142,000/yr.
    """
    lower = text.lower()
    
    # Check if this is an annual salary mention (e.g. $140,000 / year)
    if 'year' in lower or 'annual' in lower:
        return 'Budget Negotiable'

    # Hourly rate patterns (e.g. $35–$50/hour, $40/hr)
    hourly_match = re.search(r'\$\s?(\d{1,3})\s*(?:[-–—]\s*\$?\s?(\d{1,3}))?\s*(?:\/hour|per hour|\/hr|per hr|hour|hr)', text, re.IGNORECASE)
    if hourly_match:
        return hourly_match.group(0).strip()

    patterns = [
        r'(?:budget|paying|pay|bounty|rate|offer)[:\s]+\$?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?(?:\s*[-–—]\s*\$?\s?\d{1,3}(?:,\d{3})*)?)',
        r'\$\s?(\d{1,3}(?:,\d{3})*)\s*(?:[-–—]\s*\$?\s?(\d{1,3}(?:,\d{3})*))?\s*(?:usd|project|fixed|flat|per project)'
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            val = m.group(0).strip()
            if not val.startswith('$') and not re.search(r'budget|paying|rate', val, re.I):
                return f"${val}"
            return val

    # Direct gig budget match like "$500" or "$1,200" attached to gig keywords
    direct_match = re.search(r'\$\s?([1-9]\d{1,3}(?:,\d{3})?)', text)
    if direct_match and any(w in lower for w in ['paying', 'budget', 'rate', 'give', 'bounty', 'fixed', 'paid']):
        return direct_match.group(0).strip()

    return 'Budget Negotiable'

def is_valid_freelance_client_tweet(tweet) -> bool:
    content = tweet.rawContent
    content_lower = content.lower()

    # Rule 1: Credibility Check - Account MUST have at least 100 followers
    followers = getattr(tweet.user, 'followersCount', 0) or 0
    if followers < 100:
        return False

    # Rule 2: Reject Advice / Story / Opinion / Guru tweets
    for adv in ADVICE_AND_STORY_EXCLUSIONS:
        if adv in content_lower:
            return False

    # Rule 3: Reject Corporate Job Postings (CV, fulltime, bachelor degree)
    for corp in CORPORATE_JOB_EXCLUSIONS:
        if corp in content_lower:
            return False

    # Rule 4: Reject Seller / Freelancer Spam
    for spam in SPAM_SELLER_PHRASES:
        if spam in content_lower:
            return False

    # Rule 5: Reject spam hashtag stuffing
    if content.count('#') > 3:
        return False

    # Rule 6: Reject obvious bot / career usernames
    username_lower = tweet.user.username.lower()
    display_lower = (tweet.user.displayname or '').lower()
    if any(k in username_lower or k in display_lower for k in ['designz', 'gfx', 'artist', 'emotes', 'commissions', 'careers', 'jobs_in', 'dailyjobs']):
        return False

    # Rule 7: MUST have explicit Client Hiring Intent (seeking a builder/coder/designer)
    has_client_signal = any(sig in content_lower for sig in CLIENT_HIRING_SIGNALS)
    
    # Must be 1st person or direct team asking for help
    is_seeking_work = any(w in content_lower for w in ['looking for', 'need a', 'hiring a', 'who can', 'anyone know', 'dm me with', 'drop portfolio', 'paying $'])

    return has_client_signal and is_seeking_work

def score_intent(text: str, followers: int, is_verified: bool):
    score = 85
    lower = text.lower()
    if any(w in lower for w in ['budget ready', 'paid gig', 'paying', 'urgent', 'immediately', 'dm with portfolio', 'reply with portfolio']):
        score += 6
    if '$' in text and 'year' not in lower:
        score += 4
    if is_verified:
        score += 4
    if followers >= 1000:
        score += 2
    return min(99, score)

async def scrape_twitter(search_query: str = None, target_count: int = 15):
    pool = AccountsPool()
    api = API(pool)

    # Check if accounts are registered
    accounts = await pool.accounts_info()
    if not accounts or not any(a.get('active') or a.get('logged_in') for a in accounts):
        print("No active Twitter accounts registered in twscrape pool.")
        print("To add cookies: python scripts/manage_x_account.py add_cookie username auth_token ct0")
        return []

    # High-precision queries for real clients hiring freelancers/builders
    queries = [
        search_query] if search_query else [
        '("looking for a freelance" OR "hiring a freelance" OR "need a freelance") (developer OR designer OR nextjs OR web) lang:en -fulltime -"bachelor" -"resume" -filter:replies',
        '("looking for someone to build" OR "need someone to build" OR "who can build me") (website OR app OR nextjs OR react OR landing page) lang:en -fulltime -filter:replies',
        '("drop your portfolio" OR "dm portfolio" OR "reply with your portfolio") (developer OR designer OR coder) lang:en -fulltime -"resume" -filter:replies',
        '("paying $" OR "budget is $") ("developer" OR "designer" OR "build" OR "landing page") lang:en -fulltime -filter:replies'
    ]

    leads = []
    seen_ids = set()

    for q in queries:
        if len(leads) >= target_count:
            break
        print(f"Scanning X (100+ followers & direct clients only): {q[:55]}...")
        try:
            async for tweet in api.search(q, limit=40):
                if tweet.id in seen_ids:
                    continue
                seen_ids.add(tweet.id)

                # Strict validation: 100+ followers, zero advice, genuine hiring client
                if not is_valid_freelance_client_tweet(tweet):
                    continue

                followers = getattr(tweet.user, 'followersCount', 0) or 0
                is_verified = bool(getattr(tweet.user, 'verified', False) or getattr(tweet.user, 'blue', False))
                blue_type = getattr(tweet.user, 'blueType', None)
                badge_type = 'gold' if blue_type == 'Business' else 'blue' if is_verified else None

                budget = extract_client_budget(tweet.rawContent)
                intent_score = score_intent(tweet.rawContent, followers, is_verified)

                created_at = tweet.date.isoformat() if hasattr(tweet, 'date') and tweet.date else datetime.utcnow().isoformat()
                exact_tweet_url = f"https://x.com/{tweet.user.username}/status/{tweet.id}"

                # Extract technical tags
                text_lower = tweet.rawContent.lower()
                tags = ['Freelance Gig']
                if is_verified:
                    tags.append('Verified')
                if followers >= 1000:
                    tags.append(f'{followers // 1000}k Followers')
                for tag in ['Next.js', 'React', 'TypeScript', 'Python', 'Supabase', 'UI/UX', 'Design', 'Shopify', 'AI', 'Stripe', 'Mobile App', 'Figma', 'Landing Page']:
                    if tag.lower() in text_lower:
                        tags.append(tag)

                clean_snippet = tweet.rawContent.replace('\n', ' ').strip()
                if len(clean_snippet) > 65:
                    clean_snippet = clean_snippet[:65] + '...'

                leads.append({
                    "id": f"x_{tweet.id}",
                    "title": f"[Client Gig] @{tweet.user.username}: \"{clean_snippet}\"",
                    "body": tweet.rawContent,
                    "author": f"@{tweet.user.username} ({tweet.user.displayname or tweet.user.username})",
                    "source": "twitter",
                    "subreddit": "𝕏 (Twitter)",
                    "url": exact_tweet_url,
                    "createdAt": created_at,
                    "intentScore": intent_score,
                    "urgency": "High" if intent_score >= 90 else "Medium",
                    "estimatedBudget": budget,
                    "matchedKeywords": tags,
                    "isVerified": is_verified,
                    "verifiedBadgeType": badge_type,
                    "status": "new"
                })

                if len(leads) >= target_count:
                    break
        except Exception as e:
            print(f"Error querying {q}: {e}")

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(leads, f, indent=2)

    print(f"\n[Success] Verified 100+ followers & pure client gigs! Saved {len(leads)} high-intent leads to {OUTPUT_FILE}")
    return leads

if __name__ == '__main__':
    query_arg = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(scrape_twitter(query_arg))
