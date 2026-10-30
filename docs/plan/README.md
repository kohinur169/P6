// path: docs/plan/README.md

# KD SOLUTION IT - PLANNING PACKAGE (INDEX)

Status: approved baseline for execution. No application code is written by this package.
Every future chat (STEP 01 to STEP 16) reads this package, then writes code for exactly one step.

## Source of truth order

1. `docs/plan/03-ownership-and-conflict-prevention.md` (what a step may touch)
2. `docs/plan/01-step-map.md` (what a step must deliver)
3. `docs/plan/07-security-zero-trust-lr022.md` (how every feature must be secured)
4. `MASTER_PROMPT .md` (absolute rules, stack, schema rules)
5. `FEATURE_LIST.md` (feature inventory, 11 parts, 3,950 features)
6. `docs/plan/` remaining documents (domain plans)

If two sources disagree, the higher entry wins. The conflict must be recorded in
`docs/plan/10-decision-register.md` before any code is written.

## Documents

| File | Purpose |
| --- | --- |
| `00-project-blueprint.md` | Architecture, invariants, folder map, environment variables, fail-closed rule |
| `01-step-map.md` | The 16 steps, sub-steps, dependencies, deliverables, acceptance gates |
| `02-chat-playbook.md` | Copy-paste kickoff block for every chat, continuation and handoff blocks |
| `03-ownership-and-conflict-prevention.md` | File, table, route and migration ownership, duplicate prevention rules |
| `04-data-model-map.md` | Complete table inventory per step, global column contract, enum list |
| `05-payment-provider-matrix.md` | 16 providers, adapters, NMI dual mode, credential console, routing, webhooks, card rules, 3DS |
| `06-mor-submerchant-and-tax.md` | MoR model, automatic sub-merchant provisioning, tax engine, filings |
| `07-security-zero-trust-lr022.md` | Zero trust layers, LR-022 session security, login lock, file and input security |
| `08-gap-analysis-and-launch-readiness.md` | Known post-launch gaps with mitigations, launch gate, live prerequisites |
| `09-handoff-and-definition-of-done.md` | Handoff format, definition of done, self-audit commands |
| `10-decision-register.md` | Every decision, status, and open question |
| `11-dependency-and-access-requests.md` | npm packages, accounts, keys, provider sandbox access requests |
| `12-feature-crosswalk.md` | Maps every FEATURE_LIST chapter to exactly one owning step |

## Execution rules

- One chat writes exactly one step. A step is executed sub-step by sub-step.
- Each sub-step ends with a commit. The step ends with a handoff document and a tag.
- No step may create a table, route, component or utility already owned by another step.
- No step may edit a registry file owned by another step. It appends through a change
  request row in its handoff document, and the owning step applies it.
- Every step chat starts by reading this package and ends by writing
  `handoffs/STEP_XX_COMPLETED.md`.
