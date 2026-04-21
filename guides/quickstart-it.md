# Quickstart — Italiano

Guida in 1 pagina per chi è pigro.

## Cosa stai per costruire

Una pipeline automatizzata che:
1. Trova i decision-maker giusti nelle aziende che vuoi targetizzare
2. Gli manda email personalizzate (Travel Rule, compliance, SaaS, orologi, qualunque sia il tuo prodotto)
3. Gestisce le risposte automaticamente (categorizza, unsubscribe, notifiche Telegram)
4. Prenota demo via Cal.com
5. Trascrive le demo con Otter (opzionale)

Costo totale operativo: **~$60-120/mese** + **€500-1500 una tantum** per LIA avvocato privacy.

## Come partire (5 minuti)

1. **Clona questo repo** dentro una cartella vuota nuova:
   ```powershell
   cd D:\GitHub
   git clone <url-di-questo-repo> il-mio-progetto-outreach
   cd il-mio-progetto-outreach
   ```

2. **Apri Claude Code** in quella cartella:
   ```powershell
   claude
   ```

3. Claude legge `CLAUDE.md` e ti saluta. Ti fa 10 domande in 10 minuti.

4. Tu rispondi. Claude prende le decisioni tecniche per te, tu decidi solo le cose che contano (chi è il target, come scrivi le email, ecc.).

5. Claude esegue tutto. Ti interrompe SOLO quando serve:
   - Un'API key (te la chiede, la metti, non ne parliamo più)
   - Un click sul browser per SaaS signup (Claude ti dà un prompt pronto da incollare nella Claude Chrome Extension)
   - Un link di verifica email
   - Pagamento carta di credito

Tempo totale setup: **3-4 ore** (di cui Claude lavora ~2h, tu ~1h di cose che richiedono browser).

## Prerequisiti (scegli cosa hai pronto PRIMA di iniziare)

**Must have**:
- PC Windows 11 con admin rights (o Mac — dillo a Claude)
- Carta di credito (per Apollo $49/mo + domini Cloudflare ~$50/anno)
- Accesso a un browser + inbox email

**Nice to have ma Claude te li guida se mancano**:
- Account Google (ne serve uno dedicato — "tuoprogetto.sales@gmail.com" — creato in incognito)
- Account Cloudflare
- Lista iniziale di tipo-aziende target (puoi brainstorming con Claude)

## Dopo il setup

- Primi **test internal** ti arrivano su Gmail dedicata (warmup week 1)
- Mentre warmup va avanti, Claude ti scrive un'email da mandare a 2-3 avvocati privacy per la LIA
- **LIA firmata in 1-2 settimane** (avvocato esterno, non bloccante)
- **Primi invii a prospect reali**: settimana 4 del warmup (dopo LIA)
- **Regime pieno**: da settimana 5 in avanti

## Cosa fa Claude automaticamente (quindi non ci devi pensare)

- Installa Postgres / Node / Caddy dove serve
- Crea database CRM con schema completo
- Configura DNS (SPF/DKIM/DMARC) per tutti i domini
- Deploya unsubscribe endpoint su Cloudflare Workers
- Deploya privacy notice page
- Importa 4 workflow n8n + credenziali bindate
- Configura Cal.com webhook
- Configura Otter auto-join
- Configura Telegram bot
- Ti scrive template email con il tuo prodotto già dentro
- Testa tutto end-to-end prima di dichiararsi fatto

## Cosa DOVRAI fare tu (nessuna scorciatoia)

- Rispondere alle 10 domande intake
- Registrarti sui SaaS (Claude ti da i prompt per Chrome ext ma il primo click lo fai tu)
- Decidere il tono delle email
- Gestire le risposte dei prospect reali (è il tuo lavoro di vendita, non di Claude)
- Contattare un avvocato per LIA (Claude scrive l'email per te)

## Cose che Claude NON fa (per tua protezione)

- Non manda email senza warmup (ti distruggerebbe la reputation dominio)
- Non scrappa LinkedIn (viola ToS + GDPR)
- Non bypassa unsubscribe (illegale + nuoce a te)
- Non paga senza tua autorizzazione (Cloudflare signup = ok, Apollo $49/mo = chiede "ok procedo col piano Basic $49/mo?")

## FAQ rapide

**"Ma se spendo $49 Apollo e poi non converto?"**
Mese 1 servono per validare product-message-fit. Se dopo 50 invii non hai nemmeno 1 reply positiva → il problema NON è Apollo, è il messaggio. Claude ti aiuta a iterare sui template.

**"E se ho già un account Brevo / Apollo / Cloudflare?"**
Dimmi all'intake che li hai, Claude li riusa. Nessuno re-signup forzato.

**"Posso cambiare idea a metà?"**
Sì. Dici a Claude "ferma, cambio target ICP" → Claude salva stato corrente, riprende da dove eri.

**"Chi legge le mie risposte?"**
Arrivano su Gmail dedicata (es. `tuoprogetto.sales@gmail.com`). Tu ti ci logghi con la password che hai scelto al signup. Solo tu (+ chi condividi le credenziali).

**"Cosa succede se mi blocca il firewall aziendale o il Wi-Fi?"**
Claude rileva gli errori e aspetta. Non è bloccante, rilanci più tardi.

---

Pronto? → apri Claude Code nella cartella → parte da solo.

Dubbi o curiosità "prima di iniziare"? → leggi `guides/detailed-guide-en.md` (lunga 30 pagine — sconsigliata, ma c'è).
