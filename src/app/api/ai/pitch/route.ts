import { NextResponse } from 'next/server';
import { Lead, UserProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const { lead, userProfile, tone = 'friendly' } = (await request.json()) as {
      lead: Lead;
      userProfile?: UserProfile;
      tone?: 'friendly' | 'confident' | 'consultative' | 'direct';
    };

    if (!lead || !lead.title) {
      return NextResponse.json({ success: false, error: 'Lead context is required.' }, { status: 400 });
    }

    const userName = userProfile?.name || 'Fellow Builder';
    const userRole = userProfile?.role || 'Full-Stack Developer';
    const userSkills = userProfile?.skills?.length
      ? userProfile.skills.join(', ')
      : 'Next.js, React, Tailwind, Supabase, APIs';
    const portfolioUrl = userProfile?.portfolioUrl || 'https://github.com';
    const turnaround = userProfile?.turnaround || '3-5 days';
    const isTwitter = lead.source === 'twitter';

    // If a Google Gemini API Key is available in the environment, we can call it
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const platformInstructions = isTwitter
          ? `Target Platform is 𝕏 (Twitter). The pitch MUST be under 260 characters so it fits neatly into a single tweet reply. Include portfolio URL (${portfolioUrl}). No hashtags spam.`
          : `Target Platform is Reddit / Social Forums. Keep under 120 words total in 2-3 short paragraphs. Include portfolio link (${portfolioUrl}).`;

        const geminiPrompt = `
You are an expert freelance copywriter. Write a short, highly persuasive, authentic direct pitch or comment reply to a potential client on ${lead.source}.

Target Post Title: "${lead.title}"
Target Post Content: "${lead.body}"
Target Platform: ${lead.subreddit || 'Reddit / 𝕏'}
Pitch Tone: ${tone}

Sender Persona:
- Name: ${userName}
- Role: ${userRole}
- Core Skills: ${userSkills}
- Portfolio Link: ${portfolioUrl}
- Estimated Turnaround: ${turnaround}

Rules for the pitch:
1. ${platformInstructions}
2. DO NOT sound like a generic AI or agency. Sound like a real, competent developer/designer speaking directly to a client.
3. Address their specific requirement immediately.
4. Give a clear, low-friction call-to-action (e.g. "Sent DM", "Happy to jump on a quick chat").
`;

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }],
              generationConfig: { maxOutputTokens: 250, temperature: 0.7 }
            })
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            return NextResponse.json({ success: true, pitch: generatedText.trim(), engine: 'gemini-1.5-flash' });
          }
        }
      } catch (aiErr) {
        console.warn('Gemini API call failed, falling back to smart template engine:', aiErr);
      }
    }

    // High-Converting Smart Template Engine (Fallback when no API key configured)
    let pitch = '';
    const cleanLeadTitle = lead.title.replace(/\[hiring\]/i, '').replace(/\[for hire\]/i, '').replace(/\[𝕏 Client Lead\]/i, '').trim();

    if (isTwitter) {
      // 𝕏 (Twitter) Tailored Pitch Formats (< 280 chars)
      const primarySkill = userProfile?.skills?.[0] || 'Next.js';
      const secondarySkill = userProfile?.skills?.[1] || 'TypeScript';

      if (tone === 'consultative') {
        pitch = `Hey! I specialize in ${primarySkill} & ${secondarySkill} builds. Can ship this cleanly within ${turnaround}. Check live work: ${portfolioUrl} — let me know if you want to chat!`;
      } else if (tone === 'confident') {
        pitch = `Available to take this on immediately. High quality ${userRole} (${turnaround} turnaround). Recent portfolio & projects: ${portfolioUrl} — feel free to DM!`;
      } else if (tone === 'direct') {
        pitch = `I can build this for you:
• Stack: ${primarySkill} / ${secondarySkill}
• Speed: ${turnaround}
• Work: ${portfolioUrl}
Shoot me a DM if still open!`;
      } else {
        // Friendly
        pitch = `Hey! Would love to help with this. I build fast with ${primarySkill} & ${secondarySkill} (${turnaround} turnaround). Portfolio: ${portfolioUrl} — let's connect!`;
      }
    } else {
      // Reddit / Forums Format
      if (tone === 'consultative') {
        pitch = `Hey! Saw your post regarding "${cleanLeadTitle}".

Usually with this kind of build, the biggest bottleneck is getting the database architecture and responsive UI locked in early to avoid rework down the line. I specialize in ${userSkills} and have shipped similar customer portals with clean turnaround (${turnaround}).

You can check out some of my recent work here: ${portfolioUrl}

Happy to take a quick look at your requirements or jump on a brief chat to outline the technical roadmap for you.`;
      } else if (tone === 'confident') {
        pitch = `Hey! I can take care of this for you. 

I'm a ${userRole} specializing in ${userSkills}. I've handled similar projects with fast, reliable turnaround (${turnaround}) and high code quality.

Here is my portfolio and past projects: ${portfolioUrl}

If you're still looking for someone, shoot me a DM with the details and we can get this kicked off right away!`;
      } else if (tone === 'direct') {
        pitch = `Hi! I'm available to help with "${cleanLeadTitle}".

• Tech Stack: ${userSkills}
• Turnaround: ${turnaround}
• Portfolio: ${portfolioUrl}

Let me know if you'd like to chat or have any quick questions!`;
      } else {
        // Default: friendly & value-focused
        pitch = `Hey there! Saw your post about "${cleanLeadTitle}" and wanted to reach out.

I work regularly with ${userSkills}, and can definitely help you get this built cleanly with a quick ${turnaround} turnaround. 

Feel free to check out my portfolio and live projects here: ${portfolioUrl}

Would love to learn a bit more about what you have in mind—feel free to shoot me a DM anytime!`;
      }
    }

    return NextResponse.json({ success: true, pitch, engine: 'smart-template-generator' });
  } catch (err: any) {
    console.error('AI Pitch API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
