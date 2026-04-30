// netlify/functions/telegram-webhook-background.mjs
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GITHUB_TOKEN = process.env.BLOG_GITHUB_TOKEN;
const PUBLISH_SECRET = process.env.PUBLISH_SECRET;
const NETLIFY_URL = 'https://bizcalcindia.netlify.app';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const body = await req.json();
    const message = body.message;

    if (!GITHUB_TOKEN) throw new Error("Missing BLOG_GITHUB_TOKEN in environment.");
    if (!TELEGRAM_TOKEN) throw new Error("Missing TELEGRAM_BOT_TOKEN in environment.");

    if (!message || String(message.chat.id) !== String(TELEGRAM_CHAT_ID)) {
      return new Response('Unauthorized or no message', { status: 200 });
    }

    const userInput = message.text;
    if (!userInput) return new Response('No text', { status: 200 });

    // 1. Acknowledge the request
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: "⚡ *BizCalc Engine* is processing your request...\nThis takes about 10-15 seconds.",
        parse_mode: 'Markdown'
      })
    });

    // 2. Decide if it's a topic or a full article
    // If it's more than 200 words, treat it as a full article to be formatted.
    const wordCount = userInput.split(/\s+/).length;
    const isFullArticle = wordCount > 150;

    let prompt = "";
    if (isFullArticle) {
      prompt = `You are a Senior Content Editor for BizCalc India. I am providing an article draft. 
      Refine it for high-authority SEO (E-E-A-T). Fix grammar, ensure a professional yet accessible tone for Indian MSME owners, and optimize the structure.
      Respond ONLY with valid JSON:
      {
        "id": "seo-optimized-slug",
        "title": "Title under 60 chars with high-intent keywords",
        "excerpt": "Meta description (150 chars) that drives clicks",
        "category": "GST & Taxes | Business Growth | Finance Tips",
        "readTime": "e.g. 6 min read",
        "imageKeywords": "3-4 Pexels search terms",
        "content": "The refined article in high-quality markdown (H2s, bolding, lists, tables)."
      }
      
      DRAFT:
      ${userInput}`;
    } else {
      prompt = `You are a Senior SEO Content Strategist for BizCalc India. 
      Write a high-authority, helpful blog article for Indian small business owners on the TOPIC: "${userInput}".
      Follow Google's E-E-A-T guidelines: provide actual value, use a professional Indian business tone, and ensure technical accuracy (especially for GST/Tax topics).
      
      Respond ONLY with valid JSON:
      {
        "id": "seo-optimized-slug",
        "title": "Title under 60 chars with high-intent keywords",
        "excerpt": "Meta description (150 chars) that drives clicks",
        "category": "GST & Taxes | Business Growth | Finance Tips",
        "readTime": "e.g. 6 min read",
        "imageKeywords": "3-4 Pexels search terms",
        "content": "A high-authority, 750-word markdown article following E-E-A-T guidelines for Indian entrepreneurs. Include: 1. A hook-driven introduction. 2. 5 detailed H2 sections with actionable insights. 3. 1 data-rich comparison table. 4. Bulleted lists for readability. 5. Strategic bolding of semantic keywords. 6. A professional closing CTA connecting the topic to BizCalc India's free tools (e.g., GST calculator, Invoice maker)."
      }`;
    }

    // 3. Generate with Gemini
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: "✍️ *Step 1/3:* Writing the SEO article..." , parse_mode: 'Markdown' })
    });

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );
    const geminiData = await geminiResp.json();
    
    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error(`Gemini API Error: ${JSON.stringify(geminiData.error || geminiData)}`);
    }

    const geminiText = geminiData.candidates[0].content.parts[0].text;
    
    let article;
    try {
      // Find the first { and the last }
      const start = geminiText.indexOf('{');
      const end = geminiText.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error("No JSON found");
      
      const jsonStr = geminiText.substring(start, end + 1);
      article = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON Parse Error. Raw text:", geminiText);
      throw new Error(`JSON Formatting Error: Gemini sent invalid formatting. Please try again with a slightly different topic.`);
    }

    // 4. Find Image & Save Gist (Parallel to save time)
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: "🖼 *Step 2/3:* Finding a professional cover image..." , parse_mode: 'Markdown' })
    });

    const pexelsPromise = fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(article.imageKeywords)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    ).then(r => r.json()).catch(() => ({ photos: [] }));

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: "💾 *Step 3/3:* Saving your draft to the system..." , parse_mode: 'Markdown' })
    });

    const [pexelsData] = await Promise.all([pexelsPromise]);
    const imageUrl = pexelsData.photos?.[0]?.src?.large2x || null;

    const draft = {
      ...article,
      coverImage: imageUrl,
      date: new Date().toISOString().split('T')[0],
      coverColor: 'from-blue-500 to-indigo-600',
    };

    const gistResp = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        description: `BizCalc Manual Draft: ${draft.title}`,
        public: false,
        files: { 'draft.json': { content: JSON.stringify(draft, null, 2) } },
      }),
    });
    
    if (!gistResp.ok) {
      let errorInfo = gistResp.statusText;
      try {
        const errorData = await gistResp.json();
        errorInfo = errorData.message || errorInfo;
      } catch (e) {}
      throw new Error(`GitHub Gist Error: ${errorInfo} (Status: ${gistResp.status})`);
    }

    const gistData = await gistResp.json();
    const gistId = gistData.id;

    if (!gistId) throw new Error("GitHub Gist ID is missing after creation.");

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: "✅ *Draft Saved!* Preparing your full review..." , parse_mode: 'Markdown' })
    });

    const fullContent = article.content.length > 2000 
      ? article.content.substring(0, 2000) + "\n\n...(Truncated for Telegram. Read full draft at link below)..." 
      : article.content;

    const escapeHTML = (str) => str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    
    const safeTitle = escapeHTML(article.title);
    const safeExcerpt = escapeHTML(article.excerpt);

    const publishUrl = `${NETLIFY_URL}/.netlify/functions/publish-blog?gist=${gistId}&token=${PUBLISH_SECRET}`;
    const gistUrl = `https://gist.github.com/${gistId}`;
    
    const responseMsg = `<b>📝 DRAFT REVIEW: ${safeTitle}</b>\n\n<i>${safeExcerpt}</i>\n\n${fullContent}\n\n🔗 <b>Full Draft Link (Cross-Check here):</b> ${gistUrl}\n\n🖼 Image: ${imageUrl ? '✅ Found' : '❌ Not found'}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: responseMsg,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [ { text: '🚀 Publish Live', url: publishUrl } ],
            [ { text: '📖 Read Full Draft', url: gistUrl } ],
            [ { text: '🗑 Delete Draft', url: `${NETLIFY_URL}/.netlify/functions/reject-blog?gist=${gistId}&token=${PUBLISH_SECRET}` } ],
          ],
        },
      }),
    });

    return new Response('Success', { status: 200 });

  } catch (err) {
    console.error(err);
    // Notify user of error
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `❌ *Error:* ${err.message}`
      })
    });
    return new Response('Error', { status: 200 }); // Always 200 to keep Telegram happy
  }
};

export const config = { path: '/.netlify/functions/telegram-webhook-background' };
