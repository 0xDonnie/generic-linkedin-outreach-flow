# Apollo People Search — Chrome Extension prompt

Paste the block below into Claude Chrome Extension on https://app.apollo.io.

Claude Code: substitute placeholders with values from `intake/answers.md` before sending.

---

```
I need to build a People Search on Apollo.io with specific filters, save it, and export to CSV. I'm already logged in.

CONTEXT:
- Project: {{PROJECT_NAME}}
- Plan: Apollo Basic Monthly ({{APOLLO_CREDITS_REMAINING}} credits)
- Previous saved searches (do NOT touch): {{EXISTING_SAVED_SEARCHES}}
- Company list to filter on: {{COMPANY_LIST_NAME}} ({{COMPANY_COUNT}} companies already imported)

FILTERS TO APPLY:

1. Clear all filters first (click "Clear all filters" or start a new search)

2. Account Lists filter:
   - Find "Lists" or "Account Lists" filter in sidebar
   - Select: {{COMPANY_LIST_NAME}}

3. Job Titles — add these one by one (IMPORTANT: click the dropdown autocomplete option, NOT Enter on free text):
   {{JOB_TITLES_LIST}}
   Example format: MLRO, Head of Compliance, Chief Compliance Officer, Compliance Officer, DPO, Data Protection Officer, Risk Officer, CEO, Managing Director, Founder, CFO

4. Employee range: {{EMPLOYEE_RANGE}}
   Example: 11-200, or 11-1000

5. Geography / Person Country: {{GEOGRAPHY}}
   Example: United Kingdom, United Arab Emirates, Singapore

6. Keywords (if specified): {{KEYWORDS}}
   (skip if empty)

AFTER FILTERS APPLIED:

7. Report back to me:
   - Total People count
   - Companies covered (X of Y in the list)
   - Sample of top 10 results (name | title | company | country)

8. FERMATI here. I will review the total and decide whether to proceed with export.

DO NOT:
- Save the search yet (we may refine filters)
- Export yet (wastes credits if filters need tweaking)
- Accept any "Qualify" trial popup — always decline
- Modify any existing saved search

If you encounter popups, trial gates, or UI changes, pause and tell me what you see.

Procedi con step 1 (Clear all filters).
```

---

## After user reviews total count

If user says "go" for export, Claude Code sends this second prompt:

```
Proceed with export:

1. Save search as: {{SAVED_SEARCH_NAME}} (e.g., "BA-Round1-EU-MiCA")
   Use "Save as NEW" — do NOT overwrite any existing saved search

2. Select all {{TOTAL_PEOPLE}} people

3. Export → Verified Emails Only, Catch-all OFF, Personal emails reveal OFF

4. Confirm credit consumption estimate: ~{{EXPECTED_CREDITS}} credits ({{PERCENT_OF_BUDGET}}% of monthly budget)

5. Click Export. If Apollo asks for any Qualify trial popup or upsell — decline.

6. After export completes, tell me:
   - CSV filename (Apollo default is apollo-contacts-export.csv)
   - Download path (usually Downloads folder)
   - Actual credits consumed

I will then move the file to the project's data/raw/ folder and load into CRM.
```

## Notes for Claude Code

- After user exports and reports filename, run:
  ```powershell
  Move-Item "$env:USERPROFILE\Downloads\apollo-contacts-export.csv" "D:\GitHub\{{PROJECT_FOLDER}}\data\raw\apollo-export-round{{N}}.csv"
  ```
- Then: `node scripts/node/load-crm.mjs` to populate `leads` table.
- Verify: `SELECT count(*) FROM leads;` — should be ~N (where N ≈ actual reveals, not total matched).
