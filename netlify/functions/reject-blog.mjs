export default async (req) => {
  const url = new URL(req.url);
  const gistId = url.searchParams.get('gist');
  const token = url.searchParams.get('token');

  if (!token || token !== process.env.PUBLISH_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!gistId) return new Response('Missing gist ID', { status: 400 });

  try {
    await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${process.env.BLOG_GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: '❌ Article rejected and discarded. A new one will arrive tomorrow morning.',
      }),
    });

    return new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#fef2f2">
        <h1 style="color:#dc2626">❌ Article Rejected</h1>
        <p>The draft has been discarded. A new article will be generated tomorrow.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};

export const config = { path: '/.netlify/functions/reject-blog' };
