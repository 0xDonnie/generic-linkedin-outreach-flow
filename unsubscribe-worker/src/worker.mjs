// Cloudflare Worker — handles one-click unsubscribe (RFC 8058 compliant).
//
// Deploy: npx wrangler deploy (from unsubscribe-worker/ directory)
// Requires: KV namespace "UNSUBSCRIBES" bound in wrangler.toml

const TOKEN_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts[0] === 'unsubscribe' && parts[1]) {
      return handleUnsubscribe(request, env, parts[1]);
    }
    if (parts.length === 0) {
      return renderInfo(env);
    }
    return new Response('Not found', { status: 404 });
  },
};

async function handleUnsubscribe(request, env, token) {
  if (!TOKEN_RE.test(token)) {
    return new Response('Invalid unsubscribe link', {
      status: 400, headers: { 'Content-Type': 'text/plain' },
    });
  }
  const existing = await env.UNSUBSCRIBES.get(token);
  if (!existing) {
    const record = {
      token,
      ts: new Date().toISOString(),
      ua: request.headers.get('user-agent') || '',
      ip: request.headers.get('cf-connecting-ip') || '',
      method: request.method,
      processed: false,
    };
    await env.UNSUBSCRIBES.put(token, JSON.stringify(record));
  }
  return renderConfirmation(env, token, !!existing);
}

function renderConfirmation(env, token, alreadyDone) {
  const company = env.COMPANY_NAME || 'the sender';
  const dpo = env.DPO_EMAIL || 'privacy@example.com';
  const headline = alreadyDone ? 'You are already unsubscribed.' : 'You have been unsubscribed.';
  const body = alreadyDone
    ? `Your address is already on our suppression list. You will not receive further emails from ${company}.`
    : `You will not receive further marketing emails from ${company}. Your removal is permanent across all our outbound domains.`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Unsubscribed — ${escapeHtml(company)}</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
         max-width: 560px; margin: 8vh auto; padding: 0 1rem; color: #222; }
  @media (prefers-color-scheme: dark) { body { color: #ddd; background: #111; } .card { border-color: #333; background: #1a1a1a; } }
  .card { border: 1px solid #ddd; border-radius: 12px; padding: 2rem; }
  h1 { margin: 0 0 1rem; font-size: 1.4rem; font-weight: 600; }
  p { margin: 0.6rem 0; }
  .muted { color: #888; font-size: 0.9rem; margin-top: 1.5rem; }
  code { font-size: 0.85rem; opacity: 0.6; }
  a { color: inherit; }
</style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(headline)}</h1>
    <p>${escapeHtml(body)}</p>
    <p class="muted">Questions or want to access / rectify / erase your data? Contact our DPO at <a href="mailto:${escapeHtml(dpo)}">${escapeHtml(dpo)}</a>.</p>
    <p class="muted"><code>ref ${escapeHtml(token.slice(0, 8))}…</code></p>
  </div>
</body>
</html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

function renderInfo(env) {
  return new Response(
    `${env.COMPANY_NAME || 'This'} — unsubscribe service. Use the link from the email footer.`,
    { status: 200, headers: { 'Content-Type': 'text/plain' } },
  );
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
