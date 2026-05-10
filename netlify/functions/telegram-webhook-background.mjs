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
      prompt = `You are Dhanvi Sharma, an SEO content strategist for BizCalc India. I am providing a raw article draft. 
      Refine it for high-authority SEO, but KEEP IT ULTRA-HUMAN. 
      CRITICAL RULES:
      - Write exactly like a human who is sharing their perspective. Use "I", "we", "here's my take".
      - ABSOLUTELY NO AI JARGON ("delve into", "navigate complexities", "in this digital age"). Rewrite any machine-like text.
      - Ensure there is real raw data (trendy or evergreen) included naturally.
      
      Respond ONLY with valid JSON:
      {
        "id": "url-friendly-slug",
        "title": "A natural, catchy title (not robotic)",
        "excerpt": "A human-sounding meta description.",
        "category": "GST & Taxes | Business Growth",
        "readTime": "e.g. 5 min read",
        "authorId": "dhanvi-sharma",
        "imageKeywords": "candid real life authentic indian business",
        "content": "The refined article in high-quality markdown. Highly opinionated, conversational, data-backed."
      }
      
      DRAFT:
      ${userInput}`;
    } else {
      prompt = `You are Dhanvi Sharma, an SEO content strategist for BizCalc India. Write a blog post about: "${userInput}".
      
      Task: KEYWORD & HUMAN WRITING
      1. Find a "low-competition, high-potential" long-tail angle for this topic. What are people actually struggling with?
      2. Write exactly like a human who just read some interesting data and is sharing their raw perspective. 
      3. Use phrases like "I was reading about...", "Here's my take on this...", "The data clearly shows..."
      4. ABSOLUTELY NO AI JARGON. Do not use words like "delve into", "navigate the complexities", "fast-paced digital world", "unveil". If it sounds like a machine wrote it, rewrite it.
      5. Include a chunk of real raw data (trendy or evergreen) to back up your points.
      
      Respond ONLY with valid JSON:
      {
        "id": "url-friendly-long-tail-slug",
        "title": "A natural, catchy title (not robotic)",
        "excerpt": "A human-sounding meta description.",
        "category": "GST & Taxes | Business Growth",
        "readTime": "e.g. 5 min read",
        "authorId": "dhanvi-sharma",
        "imageKeywords": "candid real life authentic indian office/business",
        "content": "A 1000-word highly opinionated, data-backed article written in the first-person ('I'). Include raw data points, 5 H2s, a table comparing real facts, and an engaging conversational tone."
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
        files: {
          'README.md': {
            content: `# ${draft.title}\n\n> ${draft.excerpt}\n\n---\n\n${draft.content}`
          },
          'draft.json': { 
            content: JSON.stringify(draft, null, 2) 
          }
        },
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

    const escapeHTML = (str) => str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    const safeTitle = escapeHTML(article.title);
    const safeExcerpt = escapeHTML(article.excerpt);

    const publishUrl = `${NETLIFY_URL}/.netlify/functions/publish-blog?gist=${gistId}&token=${PUBLISH_SECRET}`;
    const previewUrl = `${NETLIFY_URL}/preview?gist=${gistId}`;
    
    const responseMsg = `<b>📝 DRAFT READY: ${safeTitle}</b>\n\n<i>${safeExcerpt}</i>\n\nYour article is ready! Click "Read Full Preview" to see exactly how it will look on your website.\n\n🖼 Image: ${imageUrl ? '✅ Found' : '❌ Not found'}`;

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
            [ { text: '👀 Read Full Preview', url: previewUrl } ],
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
