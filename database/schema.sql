-- ─────────────────────────────────────────────────────────────────────────────
-- Generic Cold-Mailing Flow — PostgreSQL schema
-- ─────────────────────────────────────────────────────────────────────────────
-- Applies to both B2B and B2C flows. Legal framework enforced by:
--   * consent_log: every lead MUST have a row before first send
--   * suppression_list: unsubscribes permanent, checked via contactable_leads view
--   * unsubscribe_token: per-lead UUID for one-click RFC 8058 compliance
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── leads ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name        TEXT NOT NULL,
    company_website     TEXT,
    country             TEXT,
    contact_name        TEXT,
    title               TEXT,
    email               TEXT NOT NULL,
    phone               TEXT,
    linkedin_url        TEXT,
    source              TEXT,                       -- 'apollo', 'hunter', 'website-role', 'manual', 'register-scrape', 'optin-db', etc.
    source_confidence   NUMERIC(3,2),               -- 0..1
    unsubscribe_token   UUID NOT NULL DEFAULT gen_random_uuid(),
    extra               JSONB,                      -- flexible bag for industry-specific fields (sector, regulatory_id, etc.)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (email)
);
CREATE INDEX IF NOT EXISTS idx_leads_company   ON leads (company_name);
CREATE INDEX IF NOT EXISTS idx_leads_country   ON leads (country);
CREATE INDEX IF NOT EXISTS idx_leads_source    ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_unsub_tok ON leads (unsubscribe_token);

-- ── suppression_list ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppression_list (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT,
    domain      TEXT,
    reason      TEXT NOT NULL,                      -- 'unsubscribed', 'bounce', 'complaint', 'manual'
    source      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (email IS NOT NULL OR domain IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_suppression_email  ON suppression_list (lower(email))  WHERE email  IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_suppression_domain ON suppression_list (lower(domain)) WHERE domain IS NOT NULL;

-- ── consent_log ──────────────────────────────────────────────────────────────
-- Legal basis record for every lead. MANDATORY — no send without a consent row.
CREATE TABLE IF NOT EXISTS consent_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id      UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    legal_basis  TEXT NOT NULL,                     -- 'legitimate_interest' (B2B) | 'consent' (B2C opt-in) | 'contract' (existing customer)
    lia_ref      TEXT,                              -- pointer to LIA document version
    optin_source TEXT,                              -- for consent-based: source DB/provider that provided opt-in proof
    optin_proof  TEXT,                              -- URL or opt-in token if applicable
    notice_sent  BOOLEAN NOT NULL DEFAULT FALSE,
    notice_at    TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consent_lead ON consent_log (lead_id);

-- ── campaigns ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    start_date        DATE,
    end_date          DATE,
    status            TEXT NOT NULL DEFAULT 'draft',   -- draft, active, paused, completed
    total_sent        INTEGER NOT NULL DEFAULT 0,
    replies           INTEGER NOT NULL DEFAULT 0,
    conversions       INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── campaign_emails ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaign_emails (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    template_used   TEXT NOT NULL,
    subject         TEXT,
    sent_at         TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'queued', -- queued, sent, bounced, failed
    opens           INTEGER NOT NULL DEFAULT 0,
    clicks          INTEGER NOT NULL DEFAULT 0,
    message_id      TEXT,                           -- SMTP Message-ID for reply threading
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, lead_id, template_used)
);
CREATE INDEX IF NOT EXISTS idx_camp_emails_campaign ON campaign_emails (campaign_id);
CREATE INDEX IF NOT EXISTS idx_camp_emails_lead     ON campaign_emails (lead_id);
CREATE INDEX IF NOT EXISTS idx_camp_emails_msgid    ON campaign_emails (message_id);

-- ── email_replies ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_replies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id        UUID REFERENCES campaign_emails(id) ON DELETE SET NULL,
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    reply_content   TEXT,
    reply_type      TEXT,                           -- interested, objection, not_interested, unsubscribe, autoreply, other
    sentiment       TEXT,                           -- positive, neutral, negative
    action_taken    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_replies_lead ON email_replies (lead_id);

-- ── demo_bookings ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS demo_bookings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    booked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    demo_date   TIMESTAMPTZ,
    status      TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, no_show, cancelled
    outcome     TEXT,
    notes       TEXT,
    transcript  TEXT,                              -- full transcript from Otter/Tactiq
    transcript_summary TEXT                        -- AI summary
);
CREATE INDEX IF NOT EXISTS idx_demos_lead ON demo_bookings (lead_id);

-- ── view: contactable_leads ──────────────────────────────────────────────────
-- The ONLY view outbound automation should read from.
CREATE OR REPLACE VIEW contactable_leads AS
SELECT l.*
FROM leads l
LEFT JOIN suppression_list s_email
       ON lower(s_email.email) = lower(l.email)
LEFT JOIN suppression_list s_domain
       ON l.email LIKE '%@' || lower(s_domain.domain)
WHERE s_email.id IS NULL
  AND s_domain.id IS NULL
  AND EXISTS (SELECT 1 FROM consent_log c WHERE c.lead_id = l.id);

-- ── trigger: keep updated_at fresh ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_touch_updated ON leads;
CREATE TRIGGER leads_touch_updated BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS campaigns_touch_updated ON campaigns;
CREATE TRIGGER campaigns_touch_updated BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
