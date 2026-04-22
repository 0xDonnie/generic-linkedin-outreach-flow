#!/usr/bin/env node
// KPI dashboard — CLI view.
// Prints: funnel, today's rate-limit usage, warmup state, engine health, recent replies.
// Usage: npm run kpi  OR  node scripts/node/kpi.mjs

import 'dotenv/config';
import pg from 'pg';

const BOLD = '\x1b[1m';
const DIM  = '\x1b[2m';
const RED  = '\x1b[31m';
const GRN  = '\x1b[32m';
const YEL  = '\x1b[33m';
const BLU  = '\x1b[34m';
const RST  = '\x1b[0m';

const c = (color, text) => `${color}${text}${RST}`;
const pct = (n, d) => (d > 0 ? `(${((Number(n) / Number(d)) * 100).toFixed(1)}%)` : '');

function bar(used, cap, width = 20) {
  const u = Number(used) || 0;
  const c2 = Number(cap) || 1;
  const ratio = Math.min(1, u / c2);
  const filled = Math.round(ratio * width);
  const color = u >= c2 ? RED : ratio > 0.8 ? YEL : GRN;
  return color + '█'.repeat(filled) + DIM + '░'.repeat(width - filled) + RST;
}

function warmupStage(day) {
  const d = Number(day) || 0;
  if (d === 0)                     return 'Not started';
  if (d <= 7)                      return 'Week 1 — cap 5/10';
  if (d <= 14)                     return 'Week 2 — cap 10/20';
  if (d <= 21)                     return 'Week 3 — cap 15/30';
  return 'Cruise — cap 20/40';
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL missing in .env');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  // ── Funnel ────────────────────────────────────────────────────────────────
  console.log(c(BOLD, '\n━━━ Funnel ━━━'));
  const funnel = await client.query(`
    SELECT
      (SELECT count(*) FROM leads)                                                                                         AS total_leads,
      (SELECT count(*) FROM contactable_leads)                                                                              AS contactable,
      (SELECT count(DISTINCT lead_id) FROM campaign_messages WHERE touch_type = 'connection_request')                       AS conn_sent,
      (SELECT count(DISTINCT lead_id) FROM campaign_messages WHERE touch_type = 'connection_request'
         AND status IN ('connection_accepted'))                                                                             AS conn_accepted,
      (SELECT count(DISTINCT lead_id) FROM campaign_messages WHERE touch_type = 'first_message')                            AS first_msg_sent,
      (SELECT count(DISTINCT lead_id) FROM li_replies WHERE reply_type IN ('interested', 'objection'))                      AS engaged_replies,
      (SELECT count(*) FROM demo_bookings WHERE status = 'scheduled')                                                       AS demos_upcoming,
      (SELECT count(*) FROM demo_bookings WHERE status = 'completed')                                                       AS demos_done
  `);
  const f = funnel.rows[0];
  console.log(`  Total leads                            ${c(BOLD, f.total_leads)}`);
  console.log(`  Contactable (consent + not opted out)  ${c(BOLD, f.contactable)}  ${DIM}${pct(f.contactable, f.total_leads)}${RST}`);
  console.log(`  Connection request sent                ${c(BOLD, f.conn_sent)}  ${DIM}${pct(f.conn_sent, f.contactable)}${RST}`);
  console.log(`  Connection accepted                    ${c(BOLD, f.conn_accepted)}  ${DIM}${pct(f.conn_accepted, f.conn_sent)}${RST}`);
  console.log(`  First message sent                     ${c(BOLD, f.first_msg_sent)}`);
  console.log(`  Engaged replies (interested/objection) ${c(BOLD, f.engaged_replies)}  ${DIM}${pct(f.engaged_replies, f.first_msg_sent)}${RST}`);
  console.log(`  Demos upcoming                         ${c(GRN, f.demos_upcoming)}`);
  console.log(`  Demos completed                        ${c(GRN, f.demos_done)}`);

  // ── Today's rate-limit usage ───────────────────────────────────────────────
  console.log(c(BOLD, "\n━━━ Today's rate-limit usage ━━━"));
  const todayCaps = await client.query(`
    SELECT
      COALESCE(SUM(connections_sent), 0) AS conn_today,
      COALESCE(SUM(messages_sent), 0)    AS msgs_today
    FROM rate_limit_log
    WHERE day = CURRENT_DATE
  `);
  const tc = todayCaps.rows[0];
  const connCap = parseInt(process.env.DAILY_LI_CONNECTION_LIMIT || '20', 10);
  const msgCap  = parseInt(process.env.DAILY_LI_MESSAGE_LIMIT    || '40', 10);
  console.log(`  Connections  ${bar(tc.conn_today, connCap)}  ${tc.conn_today}/${connCap}`);
  console.log(`  Messages     ${bar(tc.msgs_today, msgCap)}  ${tc.msgs_today}/${msgCap}`);

  // ── Warmup state ───────────────────────────────────────────────────────────
  console.log(c(BOLD, '\n━━━ Warmup ━━━'));
  const warmupDay = parseInt(process.env.WARMUP_DAY || '0', 10);
  console.log(`  WARMUP_DAY=${warmupDay}  ${DIM}(${warmupStage(warmupDay)})${RST}`);
  console.log(`  Engine: ${c(BLU, process.env.LINKEDIN_ENGINE || 'not set')}`);
  console.log(`  Send window: ${process.env.SEND_HOUR_START || '9'}:00 – ${process.env.SEND_HOUR_END || '18'}:00`);

  // ── Last 7 days activity ───────────────────────────────────────────────────
  console.log(c(BOLD, '\n━━━ Last 7 days ━━━'));
  const last7 = await client.query(`
    SELECT day, connections_sent, messages_sent
    FROM rate_limit_log
    WHERE day >= CURRENT_DATE - INTERVAL '6 days'
    ORDER BY day
  `);
  if (last7.rows.length === 0) {
    console.log(`  ${DIM}No activity in last 7 days${RST}`);
  } else {
    for (const r of last7.rows) {
      const date = new Date(r.day).toISOString().slice(0, 10);
      console.log(`  ${date}  conn=${String(r.connections_sent).padStart(3)}  msg=${String(r.messages_sent).padStart(3)}`);
    }
  }

  // ── Engine health ──────────────────────────────────────────────────────────
  console.log(c(BOLD, '\n━━━ Engine health ━━━'));
  const engine = (process.env.LINKEDIN_ENGINE || '').toLowerCase();
  if (engine === 'heyreach') {
    if (!process.env.HEYREACH_API_KEY) {
      console.log(`  HeyReach API: ${c(YEL, 'API key not set')}`);
    } else {
      try {
        const res = await fetch('https://api.heyreach.io/api/public/account/GetAll', {
          headers: { 'X-API-KEY': process.env.HEYREACH_API_KEY },
          signal: AbortSignal.timeout(5000),
        });
        console.log(`  HeyReach API: ${res.ok ? c(GRN, 'OK') : c(RED, `HTTP ${res.status}`)}`);
      } catch (e) {
        console.log(`  HeyReach API: ${c(RED, 'unreachable: ' + e.message)}`);
      }
    }
  } else if (engine === 'linkedhelper') {
    const url = (process.env.LINKEDHELPER_LOCAL_URL || 'http://127.0.0.1:7337').replace(/\/+$/, '') + '/api/ping';
    try {
      const res = await fetch(url, {
        headers: process.env.LINKEDHELPER_API_KEY ? { 'X-API-KEY': process.env.LINKEDHELPER_API_KEY } : {},
        signal: AbortSignal.timeout(3000),
      });
      console.log(`  LinkedHelper local: ${res.ok ? c(GRN, 'OK') : c(RED, `HTTP ${res.status}`)}`);
    } catch (e) {
      console.log(`  LinkedHelper local: ${c(RED, 'unreachable (is LinkedHelper running?): ' + e.message)}`);
    }
  } else {
    console.log(`  ${YEL}LINKEDIN_ENGINE not set — skip${RST}`);
  }

  // ── Recent replies ────────────────────────────────────────────────────────
  console.log(c(BOLD, '\n━━━ Recent replies (last 5) ━━━'));
  const replies = await client.query(`
    SELECT r.created_at, r.reply_type, r.sentiment, l.contact_name, l.company_name
    FROM li_replies r
    LEFT JOIN leads l ON l.id = r.lead_id
    ORDER BY r.created_at DESC
    LIMIT 5
  `);
  if (replies.rows.length === 0) {
    console.log(`  ${DIM}No replies yet${RST}`);
  } else {
    for (const r of replies.rows) {
      const color = r.sentiment === 'positive' ? GRN : r.sentiment === 'negative' ? RED : YEL;
      const when = new Date(r.created_at).toISOString().slice(0, 16).replace('T', ' ');
      console.log(`  ${when}  ${c(color, (r.reply_type || 'other').padEnd(18))}  ${r.contact_name || '—'} @ ${r.company_name || '—'}`);
    }
  }

  console.log('');
  await client.end();
}

main().catch((err) => {
  console.error('[kpi] FATAL:', err.message);
  process.exit(1);
});
