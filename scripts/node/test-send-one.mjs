// Local test send — sends 1 email using template + first contactable lead.
// Used for smoke-testing full pipeline before activating warmup.
//
// Usage:
//   node scripts/node/test-send-one.mjs                           # auto-pick first contactable lead, actually send
//   node scripts/node/test-send-one.mjs --dry-run                 # render only
//   node scripts/node/test-send-one.mjs --to you@gmail.com        # override destination (send to yourself)
//   node scripts/node/test-send-one.mjs --lead-email x@y.com      # target a specific lead

import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import pg from 'pg';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1] || true]);
    return acc;
  }, [])
);

const DRY_RUN = !!args['dry-run'];
const LEAD_EMAIL = args['lead-email'];
const OVERRIDE_TO = args.to;
const FROM = args.from || process.env.DEFAULT_FROM_ADDRESS || `sales@${(process.env.PRIMARY_OUTBOUND_DOMAIN || 'example.com')}`;
const TEMPLATE_NAME = args.template || 'cold-outreach-v1';

const TEMPLATE_DIR = path.resolve(process.env.TEMPLATE_DIR || './templates/email-templates');

function frameworkByCountry(country) {
  if (!country) return '';
  const c = country.toLowerCase();
  if (c.includes('united kingdom') || c === 'uk') return 'FCA';
  if (c.includes('emirates') || c === 'uae') return 'VARA';
  if (c.includes('singapore')) return 'MAS';
  return 'MiCA';
}

async function loadTemplate(name) {
  return fs.readFile(path.join(TEMPLATE_DIR, `${name}.md`), 'utf8');
}

function render(tpl, lead) {
  const replacements = {
    '{{contact_name}}': (lead.contact_name || '').split(' ')[0] || 'there',
    '{{company_name}}': lead.company_name || '',
    '{{country}}': lead.country || '',
    '{{compliance_framework}}': frameworkByCountry(lead.country),
    '{{sender.first_name}}': process.env.SENDER_FIRST_NAME || '',
    '{{sender.full_name}}': process.env.SENDER_FULL_NAME || '',
    '{{sender.title}}': process.env.SENDER_TITLE || '',
    '{{sender.company}}': process.env.SENDER_COMPANY || '',
    '{{sender.calendar_url}}': process.env.SENDER_CALENDAR_URL || '',
    '{{compliance.dpo_email}}': process.env.DPO_EMAIL || '',
    '{{compliance.privacy_url}}': process.env.PRIVACY_NOTICE_URL || '',
    '{{compliance.unsubscribe_url}}': `${process.env.UNSUBSCRIBE_BASE_URL || ''}/${lead.unsubscribe_token}`,
    '{{compliance.company_legal_name}}': process.env.COMPANY_LEGAL_NAME || '',
    '{{compliance.company_address}}': process.env.COMPANY_ADDRESS || '',
    // product-specific (filled by intake)
    '{{HOOK_SUBJECT}}': process.env.HOOK_SUBJECT_TEMPLATE || `Question about {{company_name}}`,
    '{{OPENING_LINE_PERSONALIZED}}': process.env.OPENING_LINE || '',
    '{{PRODUCT_PITCH_2_LINES}}': process.env.PRODUCT_PITCH || '',
    '{{BENEFIT_1}}': process.env.BENEFIT_1 || '',
    '{{BENEFIT_2}}': process.env.BENEFIT_2 || '',
    '{{BENEFIT_3}}': process.env.BENEFIT_3 || '',
    '{{CLOSING_DIFFERENTIATOR}}': process.env.CLOSING_DIFFERENTIATOR || '',
    '{{LEGITIMATE_INTEREST_JUSTIFICATION}}': process.env.LEGITIMATE_INTEREST_JUSTIFICATION || '',
    '{{PRODUCT_CATEGORY}}': process.env.PRODUCT_CATEGORY || '',
  };
  // Two-pass: first resolve lead-specific, then product-level (so {{company_name}} resolves inside {{HOOK_SUBJECT}})
  let rendered = tpl;
  for (let pass = 0; pass < 2; pass++) {
    for (const [k, v] of Object.entries(replacements)) {
      rendered = rendered.split(k).join(v ?? '');
    }
  }
  return rendered;
}

function splitSubject(rendered) {
  const lines = rendered.split('\n');
  const subjLine = (lines[0] || '').replace(/^Subject:\s*/i, '').trim();
  const body = lines.slice(1).join('\n').trim();
  return { subject: subjLine, body };
}

async function fetchLead(client, email) {
  if (!email) return null;
  const res = await client.query(
    `SELECT l.* FROM leads l WHERE lower(l.email) = lower($1) LIMIT 1`,
    [email],
  );
  return res.rows[0] || null;
}

async function fetchAnyContactableLead(client) {
  const res = await client.query(
    `SELECT * FROM contactable_leads ORDER BY created_at LIMIT 1`,
  );
  return res.rows[0] || null;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing in .env');
  if (!DRY_RUN && !process.env.SMTP_HOST) throw new Error('SMTP_* missing in .env (required for real send)');

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const lead = LEAD_EMAIL
    ? await fetchLead(client, LEAD_EMAIL)
    : await fetchAnyContactableLead(client);

  if (!lead) {
    console.error(`No lead found${LEAD_EMAIL ? ` for ${LEAD_EMAIL}` : ' (contactable_leads empty)'}`);
    await client.end();
    process.exit(1);
  }

  console.log('[send] Lead:', {
    name: lead.contact_name || '(role address)',
    company: lead.company_name,
    country: lead.country,
    email: lead.email,
  });

  const tpl = await loadTemplate(TEMPLATE_NAME);
  const rendered = render(tpl, lead);
  const { subject, body } = splitSubject(rendered);

  console.log('\n─── RENDERED ───');
  console.log('Subject:', subject);
  console.log();
  console.log(body);
  console.log('────────────────\n');

  if (DRY_RUN) {
    console.log('[send] --dry-run set, skipping SMTP');
    await client.end();
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const recipient = OVERRIDE_TO || lead.email;
  console.log(`[send] Sending from ${FROM} → ${recipient}…`);

  const info = await transporter.sendMail({
    from: `"${process.env.SENDER_FULL_NAME || ''}" <${FROM}>`,
    to: recipient,
    replyTo: FROM,
    subject,
    text: body,
    headers: {
      'List-Unsubscribe': `<${process.env.UNSUBSCRIBE_BASE_URL}/${lead.unsubscribe_token}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  console.log('[send] ✓ Sent. Message ID:', info.messageId);
  console.log('[send] SMTP response:', info.response);

  await client.end();
}

main().catch((err) => {
  console.error('[send] FATAL:', err.message);
  process.exit(1);
});
