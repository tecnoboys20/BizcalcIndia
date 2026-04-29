export default async (req) => {
  const url = new URL(req.url);
  const gistId = url.searchParams.get('gist');
  const token = url.searchParams.get('token');

  if (!token || token !== process.env.PUBLISH_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!gistId) return new Response('Missing gist ID', { status: 400 });

  const GITHUB_TOKEN = process.env.BLOG_GITHUB_TOKEN;
  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  const OWNER = 'tecnoboys20';
  const REPO = 'BizcalcIndia';

  try {
    // 1. Read the draft from GitHub Gist
    const gistResp = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' },
    });
    const gistData = await gistResp.json();
    const draft = JSON.parse(gistData.files['draft.json'].content);

    // 2. Read current blogPosts.js from GitHub
    const fileResp = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/src/data/blogPosts.js`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' },
    });
    const fileData = await fileResp.json();
    const currentContent = atob(fileData.content.replace(/\n/g, ''));

    // 3. Build new post entry string
    const safeContent = draft.content.replace(/`/g, "'");
    const newEntry = `  {
    id: '${draft.id}',
    title: ${JSON.stringify(draft.title)},
    excerpt: ${JSON.stringify(draft.excerpt)},
    category: ${JSON.stringify(draft.category)},
    date: '${draft.date}',
    readTime: ${JSON.stringify(draft.readTime)},
    coverImage: ${draft.coverImage ? JSON.stringify(draft.coverImage) : 'null'},
    coverColor: 'from-blue-500 to-indigo-600',
    content: \`${safeContent}\`
  },\n`;

    // 4. Inject at top of the array
    const updatedContent = currentContent.replace('export const blogPosts = [\n', `export const blogPosts = [\n${newEntry}`);

    // 5. Commit to GitHub (triggers Netlify auto-deploy)
    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/src/data/blogPosts.js`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message: `blog: Publish "${draft.title}"`,
        content: btoa(unescape(encodeURIComponent(updatedContent))),
        sha: fileData.sha,
      }),
    });

    // 6. Delete the Gist (cleanup)
    await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' },
    });

    // 7. Notify Telegram
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `✅ *Published!*\n\n"${draft.title}"\n\nNetlify is deploying it now (~60 seconds). 🚀`,
        parse_mode: 'Markdown',
      }),
    });

    return new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#f0fdf4">
        <h1 style="color:#16a34a">✅ Article Published!</h1>
        <p><strong>${draft.title}</strong></p>
        <p>Netlify is deploying it now. It will be live in ~60 seconds.</p>
        <p><a href="https://bizcalcindia.netlify.app/blog">View Blog →</a></p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};

export const config = { path: '/.netlify/functions/publish-blog' };
