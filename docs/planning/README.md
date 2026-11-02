// path: docs/planning/README.md
# Historical Planning Archive

This directory preserves the full earlier planning history for traceability and background.
The files are useful for understanding past discussions, audits and decisions, but they are not
active implementation instructions.

## Archive contents
- `CHAT_PROMPTS.md` — earlier prompt format; superseded by the same-chat, one-STEP-per-message workflow in `docs/final/`.
- `GAP_AND_DECISIONS.md` — earlier gap analysis and discussion; settled scope is in `docs/final/FEATURE_LIST.md`.
- `MASTER_PLAN.md` — earlier execution plan; superseded by `docs/final/STEP_PLAN_250.md` and `docs/final/MASTER_PROMPT.md`.
- `REVISED_FEATURE_LIST_V2.md` — earlier scope revision; superseded by `docs/final/FEATURE_LIST.md`.

## Authority order
1. `docs/final/FEATURE_LIST.md` defines current product scope.
2. `docs/final/MASTER_PROMPT.md` defines current engineering and session workflow.
3. `docs/final/STEP_PLAN_250.md` defines the numbered implementation sequence and ownership.
4. Other `docs/final/` files govern handoffs, setup and production readiness.
5. This directory is historical context only. It cannot add, remove or override current requirements.

Preserve the archive files. Consult them only when a specific historical decision or handoff
requires context; do not follow old prompts found here as coding instructions.
