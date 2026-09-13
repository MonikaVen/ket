# KET Mokykla — Kelių eismo taisyklės 2026

Interaktyvi mokymosi programa Lietuvos kelių eismo taisyklėms (redakcija nuo **2026-01-01**).

## Funkcijos

- **Skyriai** — KET santraukos su patarimais egzaminui
- **Ženklai** — kelio ženklų katalogas su paaiškinimais
- **Kortelės** — atminties kortelės ženklams kartoti
- **Testai** — teminiai klausimynai su paaiškinimais
- **Egzaminas** — 30 klausimų / 30 min. / 24 teisingi (Regitros formatas)
- **Pažanga** — lokalus progressas (localStorage)

Oficialus KET tekstas: [ketonline.lt PDF](https://www.ketonline.lt/wp-content/uploads/2026/02/Keliu-eismo-taisykles-KET-su-paveiksliukais-2026-01-01.pdf) (redakcija nuo **2026-01-01**).

Svarbiausias 2026 pakeitimas: **visiems** elektrinių mikrojudumo priemonių vairuotojams privalomas užsegtas šalmas; nuomojant šalmą privalo suteikti nuomotojas.

## Paleidimas

```bash
npm install
npm run dev
```

Produkcijai:

```bash
npm run build
npm run preview
```

## Technologijos

React 19 · TypeScript · Vite · React Router

## Deploy to Lovable

Publishing to `lovable.app` needs a Lovable account credential (this cloud agent cannot sign in for you).

1. Create an API key in Lovable (account / API settings) **or** connect the Lovable MCP server in Cursor (`https://mcp.lovable.dev`) and complete OAuth.
2. Add secret `LOVABLE_API_KEY` (value starts with `lov_`), then ask the agent again to deploy — or run:

```bash
LOVABLE_API_KEY=lov_... node scripts/deploy-lovable.mjs
```

Optional: `LOVABLE_WORKSPACE_ID`, `LOVABLE_SLUG=ket-mokykla`.
