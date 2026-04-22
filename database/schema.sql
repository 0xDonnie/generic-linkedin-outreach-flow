-- ─────────────────────────────────────────────────────────────────────────────
-- Generic LinkedIn Outreach Flow — PostgreSQL schema
-- ─────────────────────────────────────────────────────────────────────────────
-- Legal framework enforced by:
--   * consent_log: every lead MUST have a row before first outreach
--   * suppression_list: opt-outs permanent, checked via contactable_leads view
--   * opt_out_token: per-lead UUID for the public opt-out form
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── leads ────────────────────────────────────────────────────────────────────
-- Core difference vs email sibling: linkedin_url is NOT NULL, email is nullable.
-- Apollo provides both; we prefer LinkedIn URL as the primary identifier for this flow.
CREATE TABLE IF NOT EXISTS leads (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name        TEXT NOT NULL,
    company_website     TEXT,
    country             TEXT,
    contact_name        TEXT,
    title               TEXT,
    linkedin_url        TEXT NOT NULL,              -- PRIMARY identifier for this flow
    linkedin_public_id  TEXT,                       -- slug portion, for deduping across URL variants
    email               TEXT,                       -- optional; used if we escalate off-platform
    phone               TEXT,
    source              TEXT,                       -- 'apollo', 'register-scrape', 'manual'
    source_confidence   NUMERIC(3,2),               -- 0..1
    opt_out_token       UUID NOT NULL DEFAULT gen_random_uuid(),
    extra               JSONB,                      -- flexible bag: industry, regulatory_id, etc.
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (linkedin_url)
);
CREATE INDEX IF NOT EXISTS idx_leads_company        ON leads (company_name);
CREATE INDEX IF NOT EXISTS idx_leads_country        ON leads (country);
CREATE INDEX IF NOT EXISTS idx_leads_source         ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_linkedin_pubid ON leads (linkedin_public_id);
CREATE INDEX IF NOT EXISTS idx_leads_opt_out_token  ON leads (opt_out_token);

-- ── suppression_list ─────────────────────────────────────────────────────────
-- Honors opt-outs forever. Can suppress by linkedin_url, linkedin_public_id, email, or company domain.
CREATE TABLE IF NOT EXISTS suppression_list (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linkedin_url        TEXT,
    linkedin_public_id  TEXT,
    email               TEXT,
    domain              TEXT,
    reason              TEXT NOT NULL,              -- 'opt_out_reply', 'opt_out_form', 'complaint', 'manual', 'connection_declined'
    source              TEXT,                       -- 'heyreach_webhook', 'linkedhelper_webhook', 'cf_pages_form', 'manual'
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (linkedin_url IS NOT NULL OR linkedin_public_id IS NOT NULL OR email IS NOT NULL OR domain IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_suppression_li_url    ON suppression_list (lower(linkedin_url))       WHERE linkedin_url       IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_suppression_li_pubid  ON suppression_list (lower(linkedin_public_id)) WHERE linkedin_public_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_suppression_email     ON suppression_list (lower(email))              WHERE email              IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_suppression_domain    ON suppression_list (lower(domain))             WHERE domain             IS NOT NULL;

-- ── consent_log ──────────────────────────────────────────────────────────────
-- Legal basis record for every lead. MANDATORY — no outreach without a consent row.
CREATE TABLE IF NOT EXISTS consent_log (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id      UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    legal_basis  TEXT NOT NULL,                     -- 'legitimate_interest' (B2B) | 'consent' (B2C opt-in) | 'contract' (existing customer)
    lia_ref      TEXT,                              -- pointer to LIA document version
    optin_source TEXT,                              -- for consent-based: source DB/provider that provided opt-in proof
    optin_proof  TEXT,                              -- URL or opt-in token if applicable
    notice_sent  BOOLEAN NOT NULL DEFAULT FALSE,    -- have we surfaced the privacy notice URL in first DM? LI art. 14 GDPR
    notice_at    TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consent_lead ON consent_log (lead_id);

-- ── campaigns ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    engine            TEXT NOT NULL,                -- 'heyreach' | 'linkedhelper'
    sender_profile    TEXT NOT NULL,                -- LinkedIn URL of the sending account
    start_date        DATE,
    end_date          DATE,
    status            TEXT NOT NULL DEFAULT 'draft',   -- draft, warmup, active, paused, completed
    warmup_day        INTEGER NOT NULL DEFAULT 0,   -- 0=not started, 1..21=ramping, 22+=cruise
    connections_sent  INTEGER NOT NULL DEFAULT 0,
    connections_accepted INTEGER NOT NULL DEFAULT 0,
    messages_sent     INTEGER NOT NULL DEFAULT 0,
    replies           INTEGER NOT NULL DEFAULT 0,
    demos_booked      INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── campaign_messages ────────────────────────────────────────────────────────
-- Replaces campaign_emails from the email sibling.
-- Each row = one LinkedIn touch (connection request, first DM, follow-up, etc.).
CREATE TABLE IF NOT EXISTS campaign_messages (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id          UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    lead_id              UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    touch_type           TEXT NOT NULL,                -- 'connection_request', 'first_message', 'follow_up_1', 'follow_up_2', 'reply_reply'
    template_used        TEXT NOT NULL,
    message_body         TEXT,                         -- rendered content (for audit)
    scheduled_at         TIMESTAMPTZ,
    sent_at              TIMESTAMPTZ,
    status               TEXT NOT NULL DEFAULT 'queued', -- queued, sent, delivered, connection_pending, connection_accepted, connection_declined, failed, skipped
    engine_message_id    TEXT,                         -- id returned by HeyReach / LinkedHelper (for reply threading + audit)
    engine_conversation_id TEXT,                       -- LinkedIn conversation/thread identifier
    error_detail         TEXT,                         -- if status=failed
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (campaign_id, lead_id, touch_type)
);
CREATE INDEX IF NOT EXISTS idx_camp_msgs_campaign   ON campaign_messages (campaign_id);
CREATE INDEX IF NOT EXISTS idx_camp_msgs_lead       ON campaign_messages (lead_id);
CREATE INDEX IF NOT EXISTS idx_camp_msgs_status     ON campaign_messages (status);
CREATE INDEX IF NOT EXISTS idx_camp_msgs_engine_id  ON campaign_messages (engine_message_id);
CREATE INDEX IF NOT EXISTS idx_camp_msgs_conv_id    ON campaign_messages (engine_conversation_id);

-- ── li_replies ───────────────────────────────────────────────────────────────
-- Replaces email_replies. Normalizes replies from HeyReach webhook / LinkedHelper webhook.
CREATE TABLE IF NOT EXISTS li_replies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID REFERENCES campaign_messages(id) ON DELETE SET NULL,
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    reply_content   TEXT,
    reply_type      TEXT,                           -- 'interested', 'objection', 'not_interested', 'opt_out', 'auto_reply', 'connection_accept', 'other'
    sentiment       TEXT,                           -- 'positive', 'neutral', 'negative'
    action_taken    TEXT,                           -- what our workflow did in response
    raw_webhook_payload JSONB,                      -- full raw event from engine, for debugging
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_li_replies_lead ON li_replies (lead_id);
CREATE INDEX IF NOT EXISTS idx_li_replies_type ON li_replies (reply_type);

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

-- ── rate_limit_log ───────────────────────────────────────────────────────────
-- Tracks daily outreach volume per campaign for rate-limit enforcement.
-- Workflow 2 reads this before scheduling next touch.
CREATE TABLE IF NOT EXISTS rate_limit_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id         UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    day                 DATE NOT NULL,
    connections_sent    INTEGER NOT NULL DEFAULT 0,
    messages_sent       INTEGER NOT NULL DEFAULT 0,
    UNIQUE (campaign_id, day)
);
CREATE INDEX IF NOT EXISTS idx_rate_limit_campaign_day ON rate_limit_log (campaign_id, day);

-- ── view: contactable_leads ──────────────────────────────────────────────────
-- The ONLY view outbound automation should read from.
-- Excludes leads on suppression list (by LinkedIn URL/public_id/email/domain)
-- and requires a consent_log entry.
CREATE OR REPLACE VIEW contactable_leads AS
SELECT l.*
FROM leads l
LEFT JOIN suppression_list s_li_url
       ON lower(s_li_url.linkedin_url) = lower(l.linkedin_url)
LEFT JOIN suppression_list s_li_pubid
       ON lower(s_li_pubid.linkedin_public_id) = lower(l.linkedin_public_id)
LEFT JOIN suppression_list s_email
       ON l.email IS NOT NULL
      AND lower(s_email.email) = lower(l.email)
LEFT JOIN suppression_list s_domain
       ON l.email IS NOT NULL
      AND l.email LIKE '%@' || lower(s_domain.domain)
WHERE s_li_url.id   IS NULL
  AND s_li_pubid.id IS NULL
  AND s_email.id    IS NULL
  AND s_domain.id   IS NULL
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
