# KET Mokykla — Kelių eismo taisyklės 2026

Interaktyvi mokymosi programa Lietuvos kelių eismo taisyklėms (redakcija nuo **2026-01-01**).

## Funkcijos

- **Skyriai** — KET santraukos su patarimais egzaminui
- **Ženklai** — katalogas su oficialiais 2026 1 priedo pavyzdžiais (nukirpti iš KET PDF)
- **Kortelės** — ženklai, taisyklės ir savo sąvokos („Pridėti sąvoką“)
- **Testai** — teminiai klausimynai su paaiškinimais; kiekviena taisyklė turi klausimą
- **Egzaminas** — 30 klausimų / 30 min. / 24 teisingi (Regitros formatas)
- **Pažanga** — be paskyros lieka naršyklėje; registracija išsaugo istoriją serveryje
- **Admin** — klausimų ir viešų kortelių valdymas (pirmas užsiregistravęs vartotojas)

Oficialus KET tekstas: [ketonline.lt PDF](https://www.ketonline.lt/wp-content/uploads/2026/02/Keliu-eismo-taisykles-KET-su-paveiksliukais-2026-01-01.pdf) (redakcija nuo **2026-01-01**).

Svarbiausias 2026 pakeitimas: **visiems** elektrinių mikrojudumo priemonių vairuotojams privalomas užsegtas šalmas; nuomojant šalmą privalo suteikti nuomotojas.

Skyriai, ženklai, testai ir egzaminas veikia **be prisijungimo**. Registracija (`/paskyra`) išsaugo pažangą ir korteles. Pirmas užsiregistravęs vartotojas tampa administratoriumi (`/admin`).

## Paleidimas

```bash
npm install
npm run dev
```

Produkcijai (statinis frontend + API pažangai ir paskyroms):

```bash
npm run build
npm start
```

## Technologijos

React 19 · TypeScript · Vite · React Router · Express (JSON saugykla `data/store.json`)

## Azure (cheapest for occasional use)

Linux **App Service Free F1** (~€0) in **Poland Central** (North Europe has no F1 quota on this subscription). The site sleeps after ~20 minutes idle and has 60 CPU minutes/day — enough for personal study. First load after sleep can take a minute.

```bash
azd auth login
azd env new ket-m4k8 --no-prompt
azd env set AZURE_LOCATION polandcentral
azd up --no-prompt
```

`azd` prints the HTTPS URL (`https://….azurewebsites.net`) and creates resource group `rg-ket-m4k8`. App Insights and Log Analytics stay on the monthly free grant.

## Deploy to Lovable

Publishing to `lovable.app` needs a Lovable account credential (this cloud agent cannot sign in for you).

1. Create an API key in Lovable (account / API settings) **or** connect the Lovable MCP server in Cursor (`https://mcp.lovable.dev`) and complete OAuth.
2. Add secret `LOVABLE_API_KEY` (value starts with `lov_`), then ask the agent again to deploy — or run:

```bash
LOVABLE_API_KEY=lov_... node scripts/deploy-lovable.mjs
```

Optional: `LOVABLE_WORKSPACE_ID`, `LOVABLE_SLUG=ket-mokykla`.
