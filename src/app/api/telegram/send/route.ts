import { NextResponse } from 'next/server';
import { Lead } from '@/types';

export async function POST(request: Request) {
  try {
    const { botToken, chatId, lead, isTest } = await request.json() as {
      botToken: string;
      chatId: string;
      lead?: Lead;
      isTest?: boolean;
    };

    if (!botToken || !chatId) {
      return NextResponse.json({ success: false, error: 'Telegram botToken and chatId are required.' }, { status: 400 });
    }

    let messageText = '';

    if (isTest || !lead) {
      messageText = `<b>Radarly AI — Telegram Alert Active</b>\n\n<i>Your bot is successfully connected.</i>\n\nYou will receive instant notifications whenever a high-intent lead or client request is discovered.\n\n<b>Filter Threshold:</b> Score ≥ 80/100\n<b>Status:</b> Monitoring Active`;
    } else {
      const budgetText = lead.estimatedBudget ? `<b>Budget:</b> ${lead.estimatedBudget}\n` : '';
      const subredditText = lead.subreddit ? `<b>Source:</b> ${lead.subreddit}\n` : '';
      
      messageText = `<b>NEW HIGH-INTENT LEAD (Score: ${lead.intentScore}/100)</b>\n\n<b>Title:</b> ${lead.title}\n${budgetText}${subredditText}<b>Urgency:</b> ${lead.urgency}\n\n<b>Excerpt:</b>\n<i>"${lead.body.slice(0, 180)}..."</i>\n\n<a href="${lead.url}">View Original Source Post</a>`;
    }

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const res = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json({
        success: false,
        error: data.description || 'Failed to send Telegram message. Please check your Bot Token and Chat ID.'
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, result: data.result });
  } catch (err: any) {
    console.error('Telegram Send API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
