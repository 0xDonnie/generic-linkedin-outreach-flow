// Sanity-check script: sends ONE LinkedIn action (connection request or message)
// via the configured engine (heyreach | linkedhelper).
//
// Usage:
//   node scripts/node/test-linkedin-send.mjs --profile "https://linkedin.com/in/john-doe" --type connection --body "Ciao John..."
//   node scripts/node/test-linkedin-send.mjs --profile "https://linkedin.com/in/john-doe" --type message    --body "Messaggio di test..."
//   node scripts/node/test-linkedin-send.mjs --dry-run    (just prints what would be sent)
//
// Does NOT write to DB. Pure sanity check of the API/HTTP connection.

import 'dotenv/config';

function parseArgs() {
  const a = process.argv.slice(2);
  const out = { dryRun: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--dry-run') out.dryRun = true;
    else if (a[i] === '--profile') out.profile = a[++i];
    else if (a[i] === '--type')    out.type    = a[++i]; // connection | message
    else if (a[i] === '--body')    out.body    = a[++i];
  }
  return out;
}

async function sendViaHeyReach({ profile, type, body }) {
  const url = 'https://api.heyreach.io/api/public/MyNetwork/SendMessage';
  const payload = {
    accountId: process.env.HEYREACH_ACCOUNT_ID,
    targetProfileUrl: profile,
    messageType: type === 'connection' ? 'CONNECTION' : 'MESSAGE',
    body,
  };
  console.log('[test] HeyReach POST', url);
  console.log('[test] payload:', { ...payload, body: body.slice(0, 60) + '...' });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.HEYREACH_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log('[test] status:', res.status);
  console.log('[test] body:', text.slice(0, 500));
  if (!res.ok) throw new Error(`HeyReach failed: HTTP ${res.status}`);
}

async function sendViaLinkedHelper({ profile, type, body }) {
  const base = process.env.LINKEDHELPER_LOCAL_URL || 'http://127.0.0.1:7337';
  const url = base + '/api/outreach';
  const payload = {
    profileUrl: profile,
    action: type === 'connection' ? 'CONNECT_WITH_NOTE' : 'SEND_MESSAGE',
    body,
  };
  console.log('[test] LinkedHelper POST', url);
  console.log('[test] payload:', { ...payload, body: body.slice(0, 60) + '...' });

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.LINKEDHELPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  console.log('[test] status:', res.status);
  console.log('[test] body:', text.slice(0, 500));
  if (!res.ok) throw new Error(`LinkedHelper failed: HTTP ${res.status}`);
}

async function main() {
  const args = parseArgs();
  const engine = (process.env.LINKEDIN_ENGINE || '').toLowerCase();

  if (!engine) {
    console.error('LINKEDIN_ENGINE missing in .env (heyreach | linkedhelper)');
    process.exit(1);
  }
  if (!['heyreach', 'linkedhelper'].includes(engine)) {
    console.error(`LINKEDIN_ENGINE=${engine} not recognized`);
    process.exit(1);
  }
  if (!args.profile || !args.type || !args.body) {
    console.error('Usage: --profile <linkedin_url> --type <connection|message> --body "<text>"');
    process.exit(1);
  }
  if (!['connection', 'message'].includes(args.type)) {
    console.error('--type must be connection or message');
    process.exit(1);
  }

  console.log(`[test] engine: ${engine}`);
  console.log(`[test] target: ${args.profile}`);
  console.log(`[test] action: ${args.type}`);

  if (args.dryRun) {
    console.log('[test] DRY RUN — not sending.');
    console.log('[test] body preview:\n---\n' + args.body + '\n---');
    return;
  }

  if (engine === 'heyreach') {
    if (!process.env.HEYREACH_API_KEY || !process.env.HEYREACH_ACCOUNT_ID) {
      console.error('HEYREACH_API_KEY or HEYREACH_ACCOUNT_ID missing in .env');
      process.exit(1);
    }
    await sendViaHeyReach(args);
  } else {
    if (!process.env.LINKEDHELPER_API_KEY) {
      console.error('LINKEDHELPER_API_KEY missing in .env');
      process.exit(1);
    }
    await sendViaLinkedHelper(args);
  }

  console.log('[test] OK — sent. Verify on LinkedIn.');
}

main().catch((err) => {
  console.error('[test] FATAL:', err.message);
  process.exit(1);
});
