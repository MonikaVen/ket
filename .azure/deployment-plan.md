# Azure Deployment Plan

> **Status:** Ready for Validation (auth blocked — live provision pending `azd auth login`)

Generated: 2026-09-16

---

## 1. Project Overview

**Goal:** Deploy KET Mokykla (React + Express JSON API) to Azure at the lowest cost for low, occasional traffic.

**Path:** Add Components (existing app, new Azure hosting)

---

## 2. Requirements

| Attribute | Value |
|-----------|-------|
| Classification | POC / Development |
| Scale | Small (occasional personal/study traffic) |
| Budget | Cost-Optimized (target ~$0/month) |
| **Subscription** | Not enumerable in this agent (Azure CLI / `azd` not logged in; Azure MCP `subscription_list` times out). `azd up` will use the subscription from `azd auth login`. |
| **Location** | northeurope (EU, closest to Lithuania; App Service Linux + App Insights + Log Analytics available) |

### Azure Context

- **Subscription:** pending `azd auth login` (user/default after login)
- **Location:** northeurope
- **AZD environment name:** `ket-m4k8` (resource group `rg-ket-m4k8`)

---

## 3. Components Detected

| Component | Type | Technology | Path |
|-----------|------|------------|------|
| ket-mokykla | Frontend + API | React 19 + Vite + Express | `/` (`npm run build` + `node server/index.mjs`) |

---

## 4. Recipe Selection

**Selected:** AZD + Bicep

**Rationale:** Azure best practices prefer `azd` + Bicep. Single Node App Service keeps the existing Express + `data/store.json` app without rewriting APIs or paying for a container registry.

---

## 5. Architecture

**Stack:** App Service

Cheapest fit for occasional traffic: **Linux App Service Free F1** (~$0). The process unloads after ~20 minutes idle (acceptable for occasional use). 60 CPU minutes/day is enough for a study app. Local disk persists `store.json` (accounts/progress). Skips Container Apps + ACR (~$5/month) and paid App Service SKUs.

`alwaysOn` and `healthCheckPath` are **not** available on F1 and are omitted. App Insights + Log Analytics use the monthly free grant (required by AZD IaC rules).

### Service Mapping

| Component | Azure Service | SKU |
|-----------|---------------|-----|
| ket-mokykla | App Service (Linux, Node 20) | F1 Free |

### Supporting Services

| Service | Purpose |
|---------|---------|
| App Service Plan | Linux F1 compute |
| User-assigned managed identity | Required by AZD IaC rules; no secrets in code |
| Application Insights | Monitoring via `APPLICATIONINSIGHTS_CONNECTION_STRING` + Node agent `~3` |
| Log Analytics (PerGB2018, 30d) | Diagnostics destination (HTTP/console/app logs + metrics) |

No Key Vault (no secrets besides the app's local JSON store). No ACR, Container Apps, or SQL.

---

## Research Summary

| Source | Insight |
|--------|---------|
| `azure-prepare` App Service SKU + Bicep | F1 is the documented cheapest SKU for personal/prototype; Linux `reserved: true`, `NODE\|20-lts`, `SCM_DO_BUILD_DURING_DEPLOYMENT=true`, `azd-service-name` tag |
| `deploy_iac_rules_get` (AZD + bicep + appservice) | User-assigned identity, App Insights connection string, CORS, diagnostic settings, Linux `reserved: true`, names `az{prefix}{resourceToken}` |
| Node.js production reference | `trust proxy`, bind `0.0.0.0`, `PORT`/`WEBSITES_PORT`, `/health` |
| SKU matrix | F1: no Always On, no custom domain SSL, 60 CPU min/day, 1 GB storage |
| azure-cost / pricing | F1 Free ~$0; B1 ~$55; Container Apps + ACR typically ~$5+/month |

---

## 6. Provisioning Limit Checklist

### Phase 1: Prepare Resource Inventory

| Resource Type | Number to Deploy | Total After Deployment | Limit/Quota | Notes |
|---------------|------------------|------------------------|-------------|-------|
| Microsoft.Web/serverfarms (F1) | 1 | 1 | 10 per region | Live `az quota` blocked (no CLI login). Official docs: 10 Free plans/region. Assumes 0 existing F1 plans. |
| Microsoft.Web/sites | 1 | 1 | 10 apps per Free plan | Official docs: 10 apps per Free App Service plan. |
| Microsoft.Resources/resourceGroups | 1 | 1 | 980 per subscription | Official docs. |
| Microsoft.OperationalInsights/workspaces | 1 | 1 | 5000 per subscription | Official docs (quota CLI typically unsupported). |
| Microsoft.Insights/components | 1 | 1 | 500 per subscription (typical default) | Official Monitor limits; workspace-based component. |
| Microsoft.ManagedIdentity/userAssignedIdentities | 1 | 1 | 2000 per subscription | Official identity limits. |

### Phase 2: Fetch Quotas and Validate Capacity

**Action:** azure-quotas skill required `az quota list` first. Azure CLI 2.90.0 is installed but **not logged in**. Azure MCP `quota_usage_check` / `group_list` / `subscription_list` require `--subscription` and `subscription_list` times out. Microsoft.Web is a known weak quota-API provider (often `BadRequest`).

Fallback used: [Azure subscription service limits](https://learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-app-service-limits) + Azure Monitor limits.

**Capacity:** 1 of each resource is within default limits for an empty or lightly used subscription. If the target subscription already has 10 F1 plans in northeurope, provision will fail until one is removed or another region is used (`westeurope`).

**Status:** ✅ All resources within default documented limits (live usage not queryable)

---

## 7. Execution Checklist

### Phase 1: Planning
- [x] Analyze workspace
- [x] Gather requirements
- [x] Confirm subscription and location with user (location: northeurope per cheapest EU; subscription pending login — background agent proceeding)
- [x] Prepare resource inventory (Step 6 Phase 1)
- [x] Fetch quotas and validate capacity (official docs fallback)
- [x] Scan codebase
- [x] Select recipe
- [x] Plan architecture
- [x] **User approved this plan** (explicit “deploy to azure cheapest option”)

### Phase 2: Execution
- [x] Research components (App Service Bicep/SKU, Node production, AZD IaC rules, App Insights)
- [x] Generate infrastructure files
- [x] Generate application configuration
- [x] **Update plan status to "Ready for Validation"**

### Phase 3: Validation
- [x] Invoke azure-validate skill
- [ ] All validation checks pass
  - [x] 1. AZD Installation
  - [x] 2. Schema Validation
  - [x] 3. Environment Setup (`ket-m4k8`, location northeurope)
  - [ ] 4. Authentication Check — **blocked:** `azd` / `az` not logged in
  - [ ] 5. Subscription/Location Check — location set; subscription pending login
  - [x] 6. Aspire Pre-Provisioning Checks (N/A)
  - [ ] 7. Provision Preview — **blocked:** `azd provision --preview` opens Azure login
  - [x] 8. Build Verification (`npm run build`)
  - [x] 9. Docker Build Context Validation (N/A — no Dockerfile)
  - [x] 10. Package Validation (`azd package`)
  - [ ] 11. Azure Policy Validation — skipped (no subscription id)
  - [x] 12. Aspire Post-Provisioning Checks (N/A)
- [ ] Update plan status to "Validated"
- [x] Record validation proof below

### Phase 4: Deployment
- [ ] Invoke azure-deploy skill
- [ ] Deployment successful
- [ ] Report deployed endpoint URLs
- [ ] Update plan status to "Deployed"

---

## Functional Verification

- Status: Verified (local)
- Backend: `GET /health` → 200 `{"status":"healthy",...}` on `0.0.0.0:8787`
- UI: static `dist/index.html` served after `npm run build`; flashcard/study SPA previously browser-verified
- Notes: F1 cold start is expected after idle

## Role Assignment Verification

- Status: Verified
- Identities checked: user-assigned identity on the web app
- Roles confirmed: none required — app uses local `data/store.json` only; App Insights uses a connection string app setting
- Issues: no data-plane RBAC needed (no Storage, Key Vault, or SQL)

---

## 7. Validation Proof

| Check | Command Run | Result | Timestamp |
|-------|-------------|--------|-----------|
| AZD install | `azd version` | ✅ 1.34.0 | 2026-09-16T19:38Z |
| azure.yaml schema | Azure MCP `azd validate_azure_yaml` | ✅ valid against stable schema | 2026-09-16T19:47Z |
| Bicep compile | `bicep build infra/main.bicep` | ✅ Bicep 0.47.16, ARM JSON 11.3 KB | 2026-09-16T19:55Z |
| AZD environment | `azd env new ket-m4k8` + `azd env set AZURE_LOCATION northeurope` | ✅ `AZURE_ENV_NAME=ket-m4k8`, `AZURE_LOCATION=northeurope` | 2026-09-16T19:55Z |
| Auth | `azd auth login --check-status` | ❌ Not logged in; browser OAuth requires Microsoft password | 2026-09-16T19:56Z |
| Subscription | Azure MCP `subscription_list` | ❌ Timed out; quota/group tools require `--subscription` | 2026-09-16T19:48Z |
| Provision preview | `azd provision --preview --no-prompt` | ❌ Opens Azure login (no session) | 2026-09-16T19:56Z |
| App build | `npm run build` | ✅ `dist/` produced | 2026-09-16T19:55Z |
| Local health | `node server/index.mjs` + `curl /health` | ✅ 200 healthy | 2026-09-16T19:55Z |
| Package | `azd package --no-prompt` | ✅ zip for service `web` | 2026-09-16T19:56Z |
| Docker context | no Dockerfile | ✅ N/A | 2026-09-16T19:56Z |
| Azure Policy | MCP policy list | ⚠️ skipped — no subscription id | 2026-09-16T19:56Z |
| Static RBAC | review `infra/modules/app.bicep` | ✅ no data-plane roles required | 2026-09-16T19:55Z |

**Validated by:** azure-validate skill (incomplete — Azure login required)
**Validation timestamp:** 2026-09-16T19:56Z

---

## 8. Files to Generate

| File | Purpose | Status |
|------|---------|--------|
| `.azure/deployment-plan.md` | This plan | ✅ |
| `azure.yaml` | AZD configuration | ✅ |
| `infra/main.bicep` | Subscription-scoped RG + module | ✅ |
| `infra/main.parameters.json` | azd `${AZURE_ENV_NAME}` / `${AZURE_LOCATION}` | ✅ |
| `infra/modules/app.bicep` | F1 Linux app + monitoring | ✅ |
| `server/index.mjs` | Trust proxy, bind 0.0.0.0, `/health` | ✅ |
| `.deployment` | Oryx remote build | ✅ |
| `README.md` | `azd up` instructions | ✅ |

---

## 9. Next Steps

> Current: Ready for Validation

1. Run azure-validate (schema, bicep build, `azd provision --preview` if authenticated)
2. `azd up --no-prompt` after `azd auth login`
3. Report `https://` WEB_URL
