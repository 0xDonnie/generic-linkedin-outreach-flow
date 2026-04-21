# Apollo ICP Brainstorm

How Claude helps the user define their Ideal Customer Profile for Apollo search. This is where 80% of campaign success is determined.

## The problem

Users often come in vague:
> "Voglio vendere marketing services alle PMI italiane"

Too broad. Apollo will return millions of hits, but reply rate will be 0.5% because targeting is scattershot.

## Claude's job at intake

Force precision. Use these 5 lenses to narrow:

### 1. **What specific pain does your product solve?**

Not "marketing services" — which specific pain?
- "We help B2B SaaS companies with ARR >$1M who are spending $10k+/mo on Google Ads without proper tracking"
- "We help luxury boutiques in Milan convert walk-ins to online loyalty members"
- "We help MLROs at MiCA-regulated CASPs reduce Chainalysis costs by 60%"

The more specific the pain, the more laser the ICP.

### 2. **Who's accountable for this pain today?**

Not "the CEO" — specifically accountable.
- MLRO, not "compliance team"
- CMO, not "marketing people"
- Head of Ecommerce, not "digital"
- General Counsel, not "legal"

Job title filters in Apollo work better when narrower.

### 3. **What company traits map to the pain?**

- Industry vertical (fintech, healthcare, luxury retail, SaaS)
- Employee size (11-50 = early stage, 51-500 = mid-market, 501-5000 = upper-mid, 5000+ = enterprise)
- Geography (country-level is enough)
- Growth stage (funded in last 12 months? hiring? revenue proxy via headcount growth?)
- Existing vendor (does the pain only exist if they use Tool X?)

### 4. **What's the natural message angle?**

The cold email tone depends on ICP:
- **MLRO / Compliance** → cost + compliance-risk angle, formal tone, cite regulation
- **CMO / Head of Growth** → growth numbers + case study, energetic tone
- **Founder / CEO of 11-50** → time savings + competitive edge, direct/casual tone
- **Luxury buyer** → exclusivity + margin + curated, elegant tone

### 5. **What excludes someone from ICP?**

Just as important:
- Do they already use a direct competitor (wasted pitch)?
- Are they too small / too big (unit economics wrong)?
- Are they in a geography you can't serve (support / TZ / legal)?

## Sample Apollo filter configs by vertical

### Vertical: Compliance SaaS (crypto)
```
Account Lists: [ESMA + FCA + VARA + MAS CASPs]
Job Titles: MLRO, Money Laundering Reporting Officer, Head of Compliance, Chief Compliance Officer, Compliance Officer, DPO, Data Protection Officer, Risk Officer, Head of Risk
Employee Range: 11-200
Geography: EU + UK + UAE + Singapore
```

### Vertical: Marketing services for B2B SaaS
```
Job Titles: CMO, Head of Marketing, Head of Growth, Head of Demand Generation, VP Marketing
Industries: SaaS, Enterprise Software, Computer Software
Employee Range: 50-500
Geography: US + UK + EU
Funding Stage: Series A, Series B
```

### Vertical: Luxury bags → boutique retailers
```
Industries: Luxury Goods & Jewelry, Retail Luxury Goods, Apparel & Fashion
Job Titles: Buyer, Head of Buying, Merchandise Manager, CEO (for <20-person boutiques)
Employee Range: 11-200
Geography: Italy, France, UK, UAE, Singapore
Exclude: big-box retail chains (>1000 employees)
```

### Vertical: Legal services for startups
```
Industries: Computer Software, Information Technology, Financial Services
Job Titles: Founder, Co-Founder, CEO, COO, General Counsel, Head of Legal, VP Operations
Employee Range: 11-100
Geography: primary market (e.g., Italy) + expansion targets
Funding Stage: Seed, Series A (highest legal demand stage)
```

### Vertical: Enterprise compliance (non-crypto)
```
Job Titles: Chief Compliance Officer, Head of Compliance, Head of Risk, Compliance Director, Chief Risk Officer, CFO (for small firms)
Industries: Financial Services, Banking, Insurance, Pharmaceutical, Healthcare
Employee Range: 500-5000
Geography: EU + UK + US
```

## Quantity target

- **Minimum viable list**: 50-100 enriched contacts (too small = no statistical signal)
- **Comfortable first campaign**: 300-500 enriched contacts
- **Aggressive**: 800-1500 (requires Apollo upgrade to more credits)

Less is often more at first: 50 high-precision contacts beat 500 noisy ones.

## When to run multiple Apollo searches

Split into separate saved searches when:
- Different geographies (different time zones, different templates)
- Different seniorities (CEO message differs from Compliance Manager message)
- Different employee-size buckets (small-firm pitch differs from enterprise pitch)

Keep each saved search with its own name: `BA-Round1-EU-MiCA`, `BA-Round2-UK-UAE-SG`, `BA-Round3-Enterprise-CRO`, etc.

## Credits math

Apollo Basic: 30K credits/year (2,500/month) on monthly plan.
- 1 credit per email reveal
- Enriching 500 contacts ≈ 500 credits
- Allow 3-4 campaign rounds/year with room for experimentation

If you hit credit limit: upgrade to Professional $79/mo (48K/year) before month-end, or wait until monthly refresh.

## Build Apollo search via extension

See `extension-prompts/apollo-people-search.md`. User's 10 intake answers feed the filter config; Claude generates a Chrome extension prompt with those filter values pre-baked.

## After export

CSV dropped in `data/raw/apollo-export.csv`. Claude runs `node scripts/node/load-crm.mjs` → leads loaded → contactable_leads view ready for warmup.
