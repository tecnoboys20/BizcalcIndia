// netlify/functions/telegram-webhook.mjs - Version 1.1 (Forced Redeploy)
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
      prompt = `You are an editor for BizCalc India. I am providing a full article. 
      Please FORMAT it for the blog. Fix any grammar, ensure it's professional, and add SEO meta data.
      Respond ONLY with valid JSON (no markdown wrapper):
      {
        "id": "url-friendly-slug",
        "title": "Professional SEO Title",
        "excerpt": "Compelling meta description",
        "category": "Pick: GST & Taxes | Business Growth | Finance Tips",
        "readTime": "Estimate, e.g. 5 min read",
        "imageKeywords": "3-4 Pexels search terms",
        "content": "The full article in high-quality markdown format (intro, H2 headers, tables, lists)."
      }
      
      ARTICLE CONTENT:
      ${userInput}`;
    } else {
      prompt = `You are a content writer for BizCalc India. 
      Write a complete, high-quality, SEO-optimized blog article based on this TOPIC: "${userInput}".
      The article should be for Indian small business owners.
      Respond ONLY with valid JSON (no markdown wrapper):
      {
        "id": "url-friendly-slug",
        "title": "Professional SEO Title",
        "excerpt": "Compelling meta description",
        "category": "Pick: GST & Taxes | Business Growth | Finance Tips",
        "readTime": "Estimate, e.g. 5 min read",
        "imageKeywords": "3-4 Pexels search terms",
        "content": "Full 700+ word markdown article: intro, 5 H2 sections, 1 table, bullet lists, and closing CTA."
      }`;
    }

    // 3. Generate with Gemini
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

    // 4. Find Image
    const pexelsResp = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(article.imageKeywords)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: PEXELS_KEY } }
    );
    const pexelsData = await pexelsResp.json();
    const imageUrl = pexelsData.photos?.[0]?.src?.large2x || null;

    // 5. Save Draft as Gist
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
    const gistData = await gistResp.json();
    const gistId = gistData.id;

    // 6. Send Preview to Telegram
    const preview = article.content.substring(0, 400).replace(/[*_[\]()~`>#+=|{}.!-]/g, '\\$&');
    const publishUrl = `${NETLIFY_URL}/.netlify/functions/publish-blog?gist=${gistId}&token=${PUBLISH_SECRET}`;
    
    const responseMsg = `📝 *Draft Ready:* ${article.title}\n\n${article.excerpt}\n\n---\n${preview}...\n\n🖼 Image: ${imageUrl ? '✅ Found' : '❌ Not found'}`;

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: responseMsg,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Publish Live', url: publishUrl },
            { text: '🗑 Delete Draft', url: `${NETLIFY_URL}/.netlify/functions/reject-blog?gist=${gistId}&token=${PUBLISH_SECRET}` },
          ]],
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

export const config = { path: '/.netlify/functions/telegram-webhook' };
