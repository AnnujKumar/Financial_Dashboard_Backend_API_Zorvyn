/*
  Render cron keep-alive job.
  Usage:
    node cron/keepalive.js https://your-api.onrender.com/health
  Or set env:
    KEEPALIVE_URL=https://your-api.onrender.com/health
*/

const inputUrl = process.argv[2] || process.env.KEEPALIVE_URL;

if (!inputUrl) {
  console.error('Missing keep-alive URL. Pass as arg or set KEEPALIVE_URL.');
  process.exit(1);
}

async function run() {
  const startedAt = new Date().toISOString();

  try {
    const response = await fetch(inputUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'render-keepalive-cron/1.0'
      }
    });

    const body = await response.text();
    const preview = body.length > 200 ? `${body.slice(0, 200)}...` : body;

    console.log(`[${startedAt}] Ping ${inputUrl} -> ${response.status}`);
    if (preview) {
      console.log(`Response: ${preview}`);
    }

    if (!response.ok) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`[${startedAt}] Keep-alive failed:`, error.message);
    process.exit(1);
  }
}

run();
