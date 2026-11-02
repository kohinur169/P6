# KD SOLUTION IT

The current implementation plan is maintained in `docs/final/` only:

- `docs/final/START_HERE.md` — repository preparation and coding workflow.
- `docs/final/FEATURE_LIST.md` — complete approved product scope.
- `docs/final/MASTER_PROMPT.md` — coding, security and workflow rules.
- `docs/final/STEP_PLAN_250.md` — 250-step implementation sequence.
- `docs/final/PRODUCTION_CHECKLIST.md` — deployment and operational readiness.
- `docs/final/HANDOFF_TEMPLATE.md` — required per-step handoff format.

Start by following `docs/final/START_HERE.md`. The complete `docs/planning/` archive is indexed by `docs/planning/README.md`; it preserves earlier prompts, decisions and feature revisions as background, not active instructions. Consult it only for historical context. `docs/final/` controls current scope, coding method and STEP order. Preserve archive files; never execute old prompts.

Database migration automation must be explicitly configured and verified. Connecting a GitHub repository to Supabase alone does not guarantee that migrations are applied. Follow the Supabase CLI/deployment procedure in `docs/final/PRODUCTION_CHECKLIST.md`.
