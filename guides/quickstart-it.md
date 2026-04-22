# Quickstart — Italiano (LinkedIn variant)

Guida in 1 pagina per chi è pigro. Per la versione "cold email" usa il repo sibling `generic-coldmailing-flow`.

## Cosa stai per costruire

Una pipeline automatizzata che:
1. Trova i decision-maker giusti nelle aziende target (via Apollo — scopre anche URL LinkedIn)
2. Manda connection request + DM personalizzati su LinkedIn (tramite HeyReach o LinkedHelper)
3. Gestisce le risposte automaticamente (classifica, opt-out, notifica Telegram)
4. Prenota demo via Cal.com
5. Trascrive le demo con Otter (opzionale)

Costo totale operativo: **~$65-200/mese** (dipende da engine scelto) + **€500-1500 una tantum** per LIA avvocato privacy.

## Decisione chiave: quale engine?

Prima di tutto devi sapere **quale LinkedIn account** userai:

- **Account consolidato** (>=1 anno, >500 connessioni, tuo vero profilo) → **HeyReach** (~$79/mo, cloud, PC off è ok, API)
- **Account nuovo / burner** (creato per questa campagna, o molto recente) → **LinkedHelper 2** (~$15-45/mo, desktop Chrome extension, PC deve stare acceso durante le finestre di invio)

Claude ti chiede questo all'intake. Se sei indeciso, Claude ti aiuta.

## Come partire (5 minuti)

1. **Clona questo repo** in una cartella vuota:
   ```powershell
   cd D:\GitHub
   git clone https://github.com/0xDonnie/generic-linkedin-outreach-flow.git il-mio-progetto-li
   cd il-mio-progetto-li
   ```

2. **Apri Claude Code** in quella cartella:
   ```powershell
   claude
   ```

3. Claude legge `CLAUDE.md` e ti saluta. Ti fa ~11 domande in 10-15 minuti.

4. Tu rispondi. Claude prende le decisioni tecniche, tu decidi solo le cose che contano (target, tone, account LinkedIn, ecc.).

5. Claude esegue tutto. Ti interrompe SOLO quando serve:
   - Una credenziale (HeyReach API key, ecc.) — te la chiede, la metti, fine
   - Un click browser per SaaS signup (Claude ti dà un prompt pronto per Claude Chrome Extension)
   - Creazione account LinkedIn (se Engine B e non ce l'hai) — la fai tu manualmente
   - Pagamento carta di credito

Tempo setup infra: **3-4 ore** di cui Claude lavora ~2h, tu ~1h di browser.

**Poi**: **2-4 settimane di warmup** (diverso tra Engine A e B, tutto guidato da Claude).

## Prerequisiti

**Must have**:
- PC Windows 11 con admin rights (o Mac — dillo a Claude)
- **Chrome installato** (mandatory per Engine B — LinkedHelper 2)
- Carta di credito (Apollo $49/mo + engine $15-79/mo + dominio landing ~$10/anno)
- Browser + inbox email

**Sul LinkedIn account**:
- Se Engine A: il tuo account LinkedIn consolidato + password + 2FA pronto
- Se Engine B: o un account LinkedIn nuovo già creato, o disponibilità a crearlo (serve numero di telefono per SMS verification)

## Cosa succede nel tempo

- **Ore 0-4**: setup infra (Claude fa quasi tutto)
- **Settimana 1-2**: profile optimization + warmup organico (Engine A: poco; Engine B: mandatorio e serio)
- **Settimana 2-3**: inizia primi invii a bassissimo volume (5-10/day)
- **Settimana 4**: ramp a 15-20 connection request/day (cruise rate)
- **LIA**: in parallelo 1-2 settimane con avvocato — NON blocca warmup
- **Regime pieno**: da settimana 5-6

## Cosa fa Claude automaticamente

- Installa Postgres / Node dove serve
- Crea database CRM (schema LinkedIn-first)
- Importa 4 workflow n8n + wire le credenziali
- Configura webhook HeyReach o LinkedHelper → n8n → CRM → Telegram
- Deploya privacy notice + opt-out form su Cloudflare Pages
- Setup Cal.com webhook, Otter auto-join, Telegram bot
- Ti scrive template DM con il tuo prodotto già dentro
- Impone rate limits LinkedIn (DAILY_LI_CONNECTION_LIMIT=20 ecc.) — non puoi superarli accidentalmente
- Ramp up graduato dei limiti settimana per settimana
- Setup della **dashboard** (CLI + Metabase opzionale) per controllare la campagna

## Dashboard — come vedi cosa succede

Due modi complementari (vedi `dashboards/README.md` per dettagli):

**CLI — check veloce**
```powershell
npm run kpi
```
Stampa nel terminale: funnel (cold → connected → replied → demo), rate limits usati oggi, warmup day corrente, engine health (HeyReach/LinkedHelper raggiungibile), ultime 5 reply. Zero infra, 2 secondi.

**Metabase — dashboard web visuale (opzionale, richiede Docker)**
```powershell
npm run dashboard:up   # avvia container su http://localhost:3000
```
Primo avvio: crei admin + connetti Postgres (~5 min clicks, guida in `dashboards/metabase/setup.md`). Poi incolli le 7 query preset (`dashboards/metabase/queries/`) e hai grafici con trend settimanali, breakdown reply, performance per template, ecc.

Claude ha uno skill dedicato (`skills/kpi-dashboard/SKILL.md`) che si attiva quando dici "come va?", "mostra KPI", "dashboard", "quanti invii oggi?", ecc. — decide automaticamente CLI o Metabase.

## Cosa DOVRAI fare tu (no shortcuts)

- Rispondere alle domande intake
- Se account LinkedIn nuovo: creare l'account (LinkedIn non permette creazione programmatica, per ragioni di sicurezza)
- Se Engine B: installare LinkedHelper desktop app sul tuo PC
- Ottimizzare il profilo LinkedIn (Claude ti dà prompt Chrome ext con steps precisi)
- Registrarti sui SaaS (primo click browser lo fai tu)
- Decidere il tone dei DM
- Rispondere ai prospect reali quando arrivano reply (è vendita, non automazione)
- Contattare avvocato per LIA (Claude scrive l'email per te)

## Cose che Claude NON fa (per tua protezione)

- Non manda outbound senza warmup (ti farebbe bannare l'account LinkedIn)
- Non scrappa LinkedIn direttamente (violazione ToS + GDPR — usa solo Apollo)
- Non supera i rate limit LinkedIn (2024-2025 caps: 100/settimana, 25/giorno max)
- Non paga senza tua autorizzazione
- Non usa LinkedHelper su VPS cloud (difenderebbe contraria alla sua sicurezza — deve stare sul tuo PC)

## Rischio ban — da leggere PRIMA

Prima di iniziare, Claude ti farà leggere `legal/linkedin-tos-risk.md`. Leggilo davvero — è 5 minuti. Riassunto: qualsiasi tool di automazione LinkedIn (HeyReach, LinkedHelper, tutti) tecnicamente viola i ToS. Il rischio ban non è zero. Il framework minimizza il rischio ma non lo elimina. Se perdi l'account, lo perdi. Acknowledge il rischio, poi vai.

## FAQ rapide

**"Quanto spendo il primo mese?"**
~$65-130 (Apollo $49 + engine $15-79 + dominio $10). A regime: stesso costo mensile, tendono a scendere se prendi plan annuali.

**"Ma vengo bannato?"**
Percentuale stimata: 2-8% a 6 mesi su HeyReach, <2% su LinkedHelper con caps conservativi. Non zero. Se perdi l'account, lo perdi definitivamente (99% dei casi LinkedIn non riapre).

**"E se ho già un account Apollo / Cloudflare / Cal.com?"**
Dimmi all'intake che li hai, Claude li riusa. Nessun re-signup.

**"Posso cambiare engine dopo?"**
Tecnicamente sì ma è un dolore — cambia processore dati (→ LIA da aggiornare), cambia credenziali, cambia workflow 2. Meglio decidere bene all'inizio.

**"Il mio PC deve stare acceso 24/7?"**
- Engine A (HeyReach): no, lavora in cloud
- Engine B (LinkedHelper): sì, durante 9-18 tua TZ. Se spegni, nessun send parte. Claude te lo ricorda.

**"Chi legge le reply?"**
Telegram notification per positive reply + demo booked. Full conversation rimane su LinkedIn (tu la leggi lì o tramite HeyReach/LinkedHelper UI).

**"Posso fare anche email in parallelo?"**
Sì, clona anche `generic-coldmailing-flow` e fai setup a parte. Stessi strumenti di base (Postgres, n8n, Cal.com, Telegram, Otter), canali diversi.

---

Pronto? → apri Claude Code nella cartella clonata → parte da solo.

Dubbi profondi prima di iniziare? → leggi `guides/claude-playbook.md` (tecnica, ma completa) o `legal/linkedin-tos-risk.md` (5 minuti, mandatory).
