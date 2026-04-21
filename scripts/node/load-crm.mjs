// Load enriched data (Apollo export, website contacts) into Postgres CRM.
// Dedups by email (UNIQUE constraint) — prefers Apollo-sourced over role-address.

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { existsSync, createReadStream } from 'node:fs';
import csvParser from 'csv-parser';
import pg from 'pg';

const APOLLO_CSV_GLOB = process.env.APOLLO_CSV_PATH || './data/raw/apollo-export.csv';
const WEBSITES_JSON   = process.env.WEBSITE_CONTACTS_JSON || './data/raw/website-contacts.json';
const LIA_REF         = process.env.LIA_REF || 'PLACEHOLDER-REPLACE-WITH-SIGNED-LIA-CODE';

function titleCase(s) { return s ? s.trim() : ''; }

async function readApolloRows(file) {
  if (!existsSync(file)) return [];
  return new Promise((resolve, reject) => {
    const out = [];
    createReadStream(file).pipe(csvParser())
      .on('data', r => out.push(r))
      .on('end', () => resolve(out))
      .on('error', reject);
  });
}

async function readWebsiteRows() {
  if (!existsSync(WEBSITES_JSON)) return [];
  const data = JSON.parse(await fs.readFile(WEBSITES_JSON, 'utf8'));
  const rows = [];
  for (const site of data) {
    for (const e of (site.emails || [])) {
      rows.push({
        company_name: site.company_name || '',
        company_website: site.website || '',
        country: site.country || '',
        contact_name: '',
        title: e.role || '',
        email: e.email,
        source: 'website-role',
        source_confidence: 0.60,
        linkedin_url: '',
      });
    }
  }
  return rows;
}

function normalizeApollo(r) {
  const name = [r['First Name'], r['Last Name']].map(titleCase).filter(Boolean).join(' ');
  const conf = r['Email Confidence']
    ? Math.min(1, Math.max(0, parseFloat(r['Email Confidence']) || 0))
    : (r['Email Status'] === 'Verified' ? 0.95 : 0.50);
  const phone = r['Work Direct Phone'] || r['Mobile Phone'] || r['Corporate Phone'] || '';
  return {
    company_name: titleCase(r['Company Name']) || titleCase(r['Company Name for Emails']),
    company_website: titleCase(r['Website']) || titleCase(r['Company Website']) || '',
    country: titleCase(r['Country']) || '',
    contact_name: name,
    title: titleCase(r['Title']) || '',
    email: (r['Email'] || '').trim().toLowerCase(),
    source: 'apollo',
    source_confidence: conf,
    linkedin_url: titleCase(r['Person Linkedin Url']) || '',
    phone,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL missing in .env');
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const apolloRaw = await readApolloRows(APOLLO_CSV_GLOB);
  const apollo = apolloRaw.map(normalizeApollo).filter(r => r.email && r.company_name);
  const websites = await readWebsiteRows();

  console.log(`[load-crm] Apollo rows valid: ${apollo.length} (raw: ${apolloRaw.length})`);
  console.log(`[load-crm] Website role emails: ${websites.length}`);

  const all = [...apollo, ...websites];
  const seen = new Map();
  for (const r of all) {
    const k = r.email.toLowerCase();
    if (!seen.has(k)) seen.set(k, r);
    else if (r.source === 'apollo' && seen.get(k).source !== 'apollo') seen.set(k, r);
  }
  const deduped = [...seen.values()];
  console.log(`[load-crm] After dedup: ${deduped.length}`);

  let inserted = 0, skipped = 0;
  await client.query('BEGIN');
  try {
    for (const r of deduped) {
      const res = await client.query(
        `INSERT INTO leads (company_name, company_website, country, contact_name, title, email, phone, linkedin_url, source, source_confidence)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [r.company_name, r.company_website, r.country, r.contact_name, r.title, r.email, r.phone || null, r.linkedin_url, r.source, r.source_confidence],
      );
      if (res.rows.length) {
        inserted++;
        await client.query(
          `INSERT INTO consent_log (lead_id, legal_basis, lia_ref) VALUES ($1, 'legitimate_interest', $2)`,
          [res.rows[0].id, LIA_REF],
        );
      } else {
        skipped++;
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }

  const totals = await client.query(`
    SELECT
      (SELECT count(*) FROM leads) AS total_leads,
      (SELECT count(*) FROM consent_log) AS consent_rows,
      (SELECT count(*) FROM contactable_leads) AS contactable
  `);
  console.log(`[load-crm] Done. Inserted ${inserted}, skipped ${skipped} (duplicates).`);
  console.log('[load-crm] DB state:', totals.rows[0]);
  await client.end();
}

main().catch((err) => {
  console.error('[load-crm] FATAL:', err.message);
  process.exit(1);
});
