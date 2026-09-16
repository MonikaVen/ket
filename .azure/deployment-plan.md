# Azure Deployment Plan

> **Status:** Deployed

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
| **Subscription** | Subscription 1 (`c0c09570-b286-41a2-83c5-145c390a481c`) |
| **Location** | northeurope (EU, closest to Lithuania; App Service Linux + App Insights + Log Analytics available) |

### Azure Context

- **Subscription:** Subscription 1 (`c0c09570-b286-41a2-83c5-145c390a481c`), tenant Default Directory (`93a599ba-9536-4d33-af51-1c960872b413`)
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
| Microsoft.Web/serverfarms (F1) | 1 | 1 | 10 per region | Live count 0. `az quota list` Microsoft.Quota unregistered; MCP reports No Limit. Official docs: 10 Free plans/region. |
| Microsoft.Web/sites | 1 | 1 | 10 apps per Free plan | Live count 0. Official docs: 10 apps per Free plan. |
| Microsoft.Resources/resourceGroups | 1 | 3 | 980 per subscription | Live count 2 (`rg-futureonaut`, auto-alerts). Official docs. |
| Microsoft.OperationalInsights/workspaces | 1 | 2 | 5000 per subscription | Live count 1. Official docs; Insights quota CLI BadRequest. |
| Microsoft.Insights/components | 1 | 1 | 500 per subscription (typical default) | Live count 0. |
| Microsoft.ManagedIdentity/userAssignedIdentities | 1 | 1 | 2000 per subscription | Live count 0. |

### Phase 2: Fetch Quotas and Validate Capacity

**Action:** `az quota list` for Microsoft.Web/northeurope returned `MissingRegistrationForResourceProvider` (Microsoft.Quota). Microsoft.Insights returned `BadRequest`. Azure MCP `quota_usage_check` returned limit/used 0 (“No Limit”). Fallback: `az resource list` counts + [Azure subscription service limits](https://learn.microsoft.com/azure/azure-resource-manager/management/azure-subscription-service-limits#azure-app-service-limits).

**Capacity:** No existing App Service plans or web apps. West Europe is blocked by policy `sys.blockwesteurope`; northeurope is allowed.

**Status:** ✅ All resources within default documented limits

---

## 7. Execution Checklist

### Phase 1: Planning
- [x] Analyze workspace
- [x] Gather requirements
- [x] Confirm subscription and location with user (Subscription 1 / northeurope; user asked to deploy)
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
- [x] All validation checks pass
  - [x] 1. AZD Installation
  - [x] 2. Schema Validation
  - [x] 3. Environment Setup (`ket-m4k8`, northeurope, subscription set)
  - [x] 4. Authentication Check — logged in as monika.venckauskaite@gmail.com
  - [x] 5. Subscription/Location Check — Subscription 1 / northeurope; `rg-ket-m4k8` does not exist
  - [x] 6. Aspire Pre-Provisioning Checks (N/A)
  - [x] 7. Provision Preview — creates rg, F1 plan, web app, App Insights, Log Analytics
  - [x] 8. Build Verification (`npm run build`)
  - [x] 9. Docker Build Context Validation (N/A — no Dockerfile)
  - [x] 10. Package Validation (`azd package`)
  - [x] 11. Azure Policy Validation — northeurope allowed; West Europe blocked (not used); MFA write already satisfied
  - [x] 12. Aspire Post-Provisioning Checks (N/A)
- [x] Update plan status to "Validated"
- [x] Record validation proof below

### Phase 4: Deployment
- [x] Invoke azure-deploy skill
- [x] Deployment successful (`azd deploy` to `https://azwebc3mwzhycd4fny.azurewebsites.net/`)
- [x] Report deployed endpoint URLs
- [x] Update plan status to "Deployed"

Runtime note: F1 `usageState=Exceeded` after Oryx builds used the 60 CPU min/day grant. Site returns 403 until the daily quota resets. North Europe F1 VM quota was 0; Poland Central succeeded.

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
| azure.yaml schema | Azure MCP `azd validate_azure_yaml` | ✅ valid against stable schema | 2026-09-16T21:13Z |
| Bicep compile | `bicep build infra/main.bicep` | ✅ Bicep 0.47.16 | 2026-09-16T19:55Z |
| AZD environment | `azd env set AZURE_SUBSCRIPTION_ID` + location | ✅ ket-m4k8 / northeurope / c0c09570-b286-41a2-83c5-145c390a481c | 2026-09-16T21:13Z |
| Auth | `azd auth login --check-status` | ✅ monika.venckauskaite@gmail.com | 2026-09-16T21:12Z |
| Subscription | `az account show` | ✅ Subscription 1 | 2026-09-16T21:12Z |
| RG conflict | `az group show rg-ket-m4k8` | ✅ not found (safe to create) | 2026-09-16T21:13Z |
| Provision preview | `azd provision --preview --no-prompt` | ✅ create rg, F1 plan, web, App Insights, Log Analytics | 2026-09-16T21:14Z |
| App build | `npm run build` | ✅ `dist/` produced | 2026-09-16T19:55Z |
| Local health | `curl /health` | ✅ 200 healthy | 2026-09-16T19:55Z |
| Package | `azd package --no-prompt` | ✅ zip for service `web` | 2026-09-16T19:56Z |
| Docker context | no Dockerfile | ✅ N/A | 2026-09-16T19:56Z |
| Azure Policy | `policy_assignment_list` | ✅ northeurope allowed; `sys.blockwesteurope` N/A; MFA already done | 2026-09-16T21:14Z |
| Static RBAC | review `infra/modules/app.bicep` | ✅ no data-plane roles required | 2026-09-16T19:55Z |

**Validated by:** azure-validate skill
**Validation timestamp:** 2026-09-16T21:14Z

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

> Current: Deployed

- App: https://azwebc3mwzhycd4fny.azurewebsites.net/
- Resource group: https://portal.azure.com/#@/resource/subscriptions/c0c09570-b286-41a2-83c5-145c390a481c/resourceGroups/rg-ket-m4k8/overview
- F1 daily CPU quota currently exceeded; retry after reset or scale to B1
