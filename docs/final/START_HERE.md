// path: docs/final/START_HERE.md
# KD SOLUTION IT - Start Here

## Active specification and historical planning archive
The six files under `docs/final/` are the only active product and implementation instructions:

1. `docs/final/FEATURE_LIST.md` — approved product scope.
2. `docs/final/MASTER_PROMPT.md` — engineering, security and work-session rules.
3. `docs/final/STEP_PLAN_250.md` — 250 ordered STEPs and file ownership.
4. `docs/final/PRODUCTION_CHECKLIST.md` — services, deployment and go-live gates.
5. `docs/final/START_HERE.md` — repository setup and owner workflow.
6. `docs/final/HANDOFF_TEMPLATE.md` — completion record for each STEP.

The complete historical planning archive is kept under `docs/planning/`. Its files are valuable context and decision/audit history, but are not current instructions. The archive bundle consists of:

- `docs/planning/README.md` — archive index and authority notice.
- `docs/planning/CHAT_PROMPTS.md` — superseded chat prompt history.
- `docs/planning/GAP_AND_DECISIONS.md` — earlier gap analysis and decision discussion.
- `docs/planning/MASTER_PLAN.md` — earlier execution plan.
- `docs/planning/REVISED_FEATURE_LIST_V2.md` — earlier feature revision.

If these archive files disagree with `docs/final/`, follow `FEATURE_LIST.md` for scope, `MASTER_PROMPT.md` for method, and `STEP_PLAN_250.md` for sequence and file ownership. Read archived material only when useful for historical rationale; never execute its old prompts.

## Create a fresh implementation repository
1. Create a new, empty GitHub repository for this build. Keep the existing `kd-solution-it` repository intact as an archive; do not delete or overwrite it.
2. Copy all six active files listed above to exactly the same paths under `docs/final/`.
3. Copy the entire `docs/planning/` archive bundle listed above. Keep the historical banner/README so old prompts cannot be mistaken for current instructions.
4. Add a short root `README.md` that states `docs/final/` contains the active instructions and `docs/planning/` is historical context only. Do not copy old application code, migrations, handoffs, root-level legacy specs, or secrets.
5. Commit the planning set and README. Select this new repository and its working branch in Arena.
6. Start with STEP 001. The new repository has no completed STEPs and must not assume the old repository's 80 handoffs.

Suggested root `README.md` text:

```markdown
# KD SOLUTION IT

The active product scope, engineering rules, STEP sequence, production checklist and handoff template are under `docs/final/`.
Start with `docs/final/START_HERE.md`.
`docs/planning/` is the complete historical planning archive; consult it only for background. It does not override `docs/final/`.
```

## One STEP request at a time, many requests in the same chat
In the first coding chat, write only:

> `Implement STEP 001`

Wait for that STEP's successful checks, commit, push and handoff. Then, in the **same chat session**, send the next separate message:

> `Implement STEP 002`

Continue one STEP request at a time—003, 004, and onward. You may continue in the same chat through STEP 040 or farther if the session remains healthy. Do not write a range such as `Implement STEP 001-040`; each request names exactly one STEP. The agent must not start a later STEP until the previous STEP has its own verified commit and handoff.

After every five completed low/medium-risk STEPs, pause for a brief progress checkpoint. Database migrations, authentication/security, money/ledger, KYC, provider, payout and production-release STEPs require an individual verification checkpoint. If context, tools, credentials or verification capacity become inadequate, stop after the last fully completed STEP. Continue in the same chat if it remains reliable; otherwise open a new chat and start from the next STEP proven by the branch handoff history. Never claim an unfinished STEP is complete.

## Resume an existing implementation
If you are working in a repository with code or handoffs, do not restart at STEP 001. Inspect the selected branch's contiguous `docs/handoffs/STEP_NNN_COMPLETED.md` sequence and latest commit. Begin only the next uncompleted STEP, read the previous handoff, and preserve completed code, migrations, commits and handoffs. Do not infer progress from memory or chat statements alone.

## STEP ownership and Arena permission prompts
The exact ownership exception for each STEP is in `STEP_PLAN_250.md`. For STEP 081, the exception is limited to MCC onboarding/profile UI, MCC-only English catalog entries, MCC-specific Zod/API integration using existing guards, and the stated additive migration. It does not authorize changing generic auth/security guards, `package.json`, earlier migrations or unrelated files.

If Arena shows an ownership/permission card, do not approve broad shared changes. Choose “Revise options or write your own…” and enter only the exact STEP-owned paths, reason and limit. If that field is unavailable, ask in chat before editing. Record every permitted cross-path change in that STEP's handoff.

## Supabase and secrets
A GitHub connection alone does not guarantee Supabase migrations will run. Follow the verified Supabase CLI/deployment procedure in `PRODUCTION_CHECKLIST.md`, and verify the target project, branch, migration history, staging and approval gates. Never paste database passwords, service-role keys, provider secrets or encryption keys into chat or Git.

## Completion gate for every STEP
Before requesting the next STEP, verify that the previous STEP has its own handoff on the selected branch; the handoff lists exact files and migrations, rollback proof where applicable, and observed typecheck, lint, build and behavior-check results. Any failed or missing gate means stop and fix that STEP first.
