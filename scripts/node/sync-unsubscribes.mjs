// Sync unsubscribe tokens from Cloudflare KV → Postgres suppression_list.
// Designed to run every 15 min via cron (VPS) or Windows Task Scheduler (local).
//
// Env required: CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NAMESPACE_ID, DATABASE_URL

import 'dotenv/config';
import axios from 'axios';
import pg from 'pg';

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN  = process.env.CF_API_TOKEN;
const CF_KV_NS      = process.env.CF_KV_NAMESPACE_ID;

const cfBase = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NS}`;
const cfHeaders = { Authorization: `Bearer ${CF_API_TOKEN}` };

async function listKeys() {
  const res = await axios.get(`${cfBase}/keys`, { headers: cfHeaders, timeout: 15_000 });
  return (res.data.result || []).map(k => k.name);
}

async function readKey(key) {
  const res = await axios.get(`${cfBase}/values/${encodeURIComponent(key)}`, {
    headers: cfHeaders, timeout: 15_000, validateStatus: () => true,
    transformResponse: [(data) => data],
  });
  if (res.status === 404) return null;
  if (res.status >= 400) throw new Error(`KV read ${res.status}`);
  try { return JSON.parse(res.data); } catch { return null; }
}

async function deleteKey(key) {
  await axios.delete(`${cfBase}/values/${encodeURIComponent(key)}`, {
    headers: cfHeaders, timeout: 15_000,
  });
}

async function main() {
  for (const v of ['CF_ACCOUNT_ID', 'CF_API_TOKEN', 'CF_KV_NAMESPACE_ID', 'DATABASE_URL']) {
    if (!process.env[v]) { console.error(`Missing env: ${v}`); process.exit(1); }
  }

  const pgClient = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();

  const tokens = await listKeys();
  console.log(`[sync] Found ${tokens.length} unsubscribe records in KV`);

  let suppressed = 0, missing = 0;
  for (const token of tokens) {
    const record = await readKey(token);
    if (!record) continue;

    const leadRes = await pgClient.query(
      `SELECT id, email FROM leads WHERE unsubscribe_token = $1 LIMIT 1`,
      [token],
    );
    if (!leadRes.rows.length) {
      missing++;
      await deleteKey(token);
      continue;
    }
    const lead = leadRes.rows[0];
    const ins = await pgClient.query(
      `INSERT INTO suppression_list (email, reason, source) VALUES ($1, 'unsubscribed', 'unsubscribe-worker')
       ON CONFLICT ((lower(email))) WHERE email IS NOT NULL DO NOTHING RETURNING id`,
      [lead.email],
    );
    if (ins.rows.length) suppressed++;
    await deleteKey(token);
  }

  console.log(`[sync] Suppressed: ${suppressed}, unknown tokens removed: ${missing}`);
  await pgClient.end();
}

main().catch((err) => { console.error('[sync] FATAL:', err.message); process.exit(1); });
