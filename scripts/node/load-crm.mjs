// Load enriched data (Apollo export) into Postgres CRM.
// Dedups by linkedin_url (UNIQUE constraint). Rows without linkedin_url are dropped — cannot outreach via LinkedIn without a profile URL.

import 'dotenv/config';
import { existsSync, createReadStream } from 'node:fs';
import csvParser from 'csv-parser';
import pg from 'pg';

const APOLLO_CSV_PATH = process.env.APOLLO_CSV_PATH || './data/raw/apollo-export.csv';
const LIA_REF         = process.env.LIA_REF || 'PLACEHOLDER-REPLACE-WITH-SIGNED-LIA-CODE';

function titleCase(s) { return s ? s.trim() : ''; }

function extractPublicId(url) {
  if (!url) return null;
  const m = url.match(/linkedin\.com\/in\/([^\/\?#]+)/i);
  return m ? m[1].toLowerCase() : null;
}

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

function normalizeApollo(r) {
  const name = [r['First Name'], r['Last Name']].map(titleCase).filter(Boolean).join(' ');
  const conf = r['Email Confidence']
    ? Math.min(1, Math.max(0, parseFloat(r['Email Confidence']) || 0))
    : (r['Email Status'] === 'Verified' ? 0.95 : 0.70);
  const phone = r['Work Direct Phone'] || r['Mobile Phone'] || r['Corporate Phone'] || '';
  const linkedin_url = titleCase(r['Person Linkedin Url']) || '';
  return {
    company_name: titleCase(r['Company Name']) || titleCase(r['Company Name for Emails']),
    company_website: titleCase(r['Website']) || titleCase(r['Company Website']) || '',
    country: titleCase(r['Country']) || '',
    contact_name: name,
    title: titleCase(r['Title']) || '',
    email: (r['Email'] || '').trim().toLowerCase() || null,
    linkedin_url,
    linkedin_public_id: extractPublicId(linkedin_url),
    source: 'apollo',
    source_confidence: conf,
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

  const apolloRaw = await readApolloRows(APOLLO_CSV_PATH);
  const apollo = apolloRaw.map(normalizeApollo)
    .filter(r => r.company_name && r.linkedin_url);  // LinkedIn URL mandatory for this flow

  const droppedNoLi = apolloRaw.length - apollo.length;
  console.log(`[load-crm] Apollo rows valid (with LinkedIn URL): ${apollo.length} (raw: ${apolloRaw.length}, dropped without LI: ${droppedNoLi})`);

  // Dedup by linkedin_url (case-insensitive)
  const seen = new Map();
  for (const r of apollo) {
    const k = r.linkedin_url.toLowerCase();
    if (!seen.has(k)) seen.set(k, r);
  }
  const deduped = [...seen.values()];
  console.log(`[load-crm] After dedup: ${deduped.length}`);

  let inserted = 0, skipped = 0;
  await client.query('BEGIN');
  try {
    for (const r of deduped) {
      const res = await client.query(
        `INSERT INTO leads (company_name, company_website, country, contact_name, title, linkedin_url, linkedin_public_id, email, phone, source, source_confidence)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (linkedin_url) DO NOTHING
         RETURNING id`,
        [r.company_name, r.company_website, r.country, r.contact_name, r.title, r.linkedin_url, r.linkedin_public_id, r.email, r.phone || null, r.source, r.source_confidence],
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
