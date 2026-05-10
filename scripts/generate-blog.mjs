import { XMLParser } from 'fast-xml-parser';
// Using native fetch (Node 18+)

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const GITHUB_TOKEN = process.env.BLOG_GITHUB_TOKEN;
const PUBLISH_SECRET = process.env.PUBLISH_SECRET;
const NETLIFY_URL = 'https://bizcalcindia.netlify.app';

async function fetchTrendingTopics() {
  const feeds = [
    'https://news.google.com/rss/search?q=india+ecommerce+D2C+retail&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=india+small+business+marketing+growth&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=india+startup+funding+tech+trends&hl=en-IN&gl=IN&ceid=IN:en',
    'https://news.google.com/rss/search?q=india+freelance+creator+economy&hl=en-IN&gl=IN&ceid=IN:en'
  ];
  const parser = new XMLParser();
  let titles = [];
  for (const url of feeds) {
    try {
      const resp = await fetch(url);
      const xml = await resp.text();
      const parsed = parser.parse(xml);
      const items = parsed.rss?.channel?.item || [];
      const arr = Array.isArray(items) ? items : [items];
      arr.slice(0, 3).forEach(i => i.title && titles.push(i.title));
    } catch (e) { console.warn('Feed error:', e.message); }
  }
  return titles.filter(Boolean).slice(0, 12);
}

async function generateArticle(topics) {
  const topicsText = topics.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const prompt = `You are Dhanvi Sharma, an SEO content strategist and writer for BizCalc India. You are a real human writing about Indian business, marketing, e-commerce, and digital growth.

Today's raw news headlines:
${topicsText}

Task 1: KEYWORD DISCOVERY
Analyze the headlines. Find a "low-competition, high-potential" niche or long-tail keyword hidden in these headlines. Look for something specific that Indian MSME owners, D2C founders, or freelancers are actually struggling with or searching for. It does NOT have to be about GST. Pick whatever has the highest potential for viral traffic or solves a real pain point (e.g., WhatsApp marketing, finding suppliers, local SEO, funding, etc.).

Task 2: ULTRA-HUMAN BLOG WRITING
Write a blog post about this specific topic. 
CRITICAL RULES FOR TONE:
- Write exactly like a human who just read some interesting data and is sharing their raw perspective. 
- Use phrases like "I was reading about...", "Here's my take on this...", "The data clearly shows..."
- ABSOLUTELY NO AI JARGON. Do not use words like "delve into", "navigate the complexities", "fast-paced digital world", "unveil", "unlock". If it sounds like a machine wrote it, rewrite it.
- Include a chunk of real raw data (trendy or evergreen) to back up your points.
- Mix trending news with evergreen advice. 

Respond ONLY with valid JSON — no markdown wrapper, no extra text:

{
  "id": "url-friendly-long-tail-slug",
  "title": "A natural, catchy title (not robotic)",
  "excerpt": "A human-sounding meta description.",
  "category": "Generate an appropriate category like: Digital Marketing, D2C Growth, Finance, Productivity, etc.",
  "readTime": "e.g. 5 min read",
  "authorId": "dhanvi-sharma",
  "imageKeywords": "candid real life authentic indian office",
  "content": "A 1000-word highly opinionated, data-backed article written in the first-person ('I'). Include raw data points, 5 H2s, a table comparing real facts, and an engaging conversational tone that connects to BizCalc India's free tools."
}`;

  const resp = await fetch(
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
  const data = await resp.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini error: ' + JSON.stringify(data.error || data));
  }
  const text = data.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in Gemini response:\n' + text.slice(0, 300));
  return JSON.parse(jsonMatch[0]);
}

async function findPexelsImage(keywords) {
  const resp = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=3&orientation=landscape`,
    { headers: { Authorization: PEXELS_KEY } }
  );
  const data = await resp.json();
  return data.photos?.[0]?.src?.large2x || data.photos?.[0]?.src?.large || null;
}

async function saveDraftAsGist(draft) {
  const resp = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      description: `BizCalc Draft: ${draft.title}`,
      public: false,
      files: { 'draft.json': { content: JSON.stringify(draft, null, 2) } },
    }),
  });
  const data = await resp.json();
  if (!data.id) throw new Error('Gist creation failed: ' + JSON.stringify(data));
  return data.id;
}

async function sendTelegram(article, imageUrl, gistId) {
  const preview = article.content.substring(0, 500).replace(/[*_[\]()~`>#+=|{}.!-]/g, '\\$&');
  const publishUrl = `${NETLIFY_URL}/.netlify/functions/publish-blog?gist=${gistId}&token=${PUBLISH_SECRET}`;
  const rejectUrl = `${NETLIFY_URL}/.netlify/functions/reject-blog?gist=${gistId}&token=${PUBLISH_SECRET}`;

  const message = `📝 *New Blog Article Ready*\n\n*${article.title}*\n🏷 ${article.category} · ⏱ ${article.readTime}\n\n${article.excerpt}\n\n---\n${preview}...\n\n🖼 Image: ${imageUrl ? 'Found ✅' : 'Not found ❌'}`;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Publish to Website', url: publishUrl },
          { text: '❌ Reject', url: rejectUrl },
        ]],
      },
    }),
  });
  console.log('✅ Telegram message sent!');
}

async function main() {
  console.log('🔍 Fetching trending topics...');
  const topics = await fetchTrendingTopics();
  console.log(`Found ${topics.length} topics`);

  console.log('🤖 Generating article with Gemini...');
  const article = await generateArticle(topics);
  console.log(`📝 Title: "${article.title}"`);

  console.log('🖼 Searching Pexels for matching image...');
  const imageUrl = await findPexelsImage(article.imageKeywords);
  console.log(`📷 Image: ${imageUrl || 'None found'}`);

  const draft = {
    ...article,
    coverImage: imageUrl,
    date: new Date().toISOString().split('T')[0],
    coverColor: 'from-blue-500 to-indigo-600',
  };

  console.log('💾 Saving draft as private GitHub Gist...');
  const gistId = await saveDraftAsGist(draft);
  console.log(`✅ Gist ID: ${gistId}`);

  console.log('📱 Sending Telegram preview...');
  await sendTelegram(article, imageUrl, gistId);
  console.log('🎉 Done! Check Telegram.');
}

main().catch(e => { console.error(e); process.exit(1); });
