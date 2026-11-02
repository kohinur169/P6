// path: docs/final/START_HERE.md
# KD SOLUTION IT - Start Here

## Approved planning files
The only active product and implementation instructions are these six files:

1. `docs/final/FEATURE_LIST.md` — complete product scope.
2. `docs/final/MASTER_PROMPT.md` — engineering, security and workflow rules.
3. `docs/final/STEP_PLAN_250.md` — exactly 250 implementation steps and their file ownership.
4. `docs/final/PRODUCTION_CHECKLIST.md` — services, deployment, operational and go-live gates.
5. `docs/final/START_HERE.md` — this repository setup and workflow guide.
6. `docs/final/HANDOFF_TEMPLATE.md` — required per-step completion record.

`FEATURE_LIST.md` defines scope; `MASTER_PROMPT.md` governs how to work; `STEP_PLAN_250.md` defines sequence and ownership. If an advisory line in an old handoff disagrees with a later approved plan amendment, preserve the handoff and follow the current plan.

## Start in a new coding repository from STEP 001
1. Create a new, empty GitHub repository for the implementation. Keep the existing `kd-solution-it` repository as an archive; do not delete or overwrite it.
2. Copy only the six files listed above into the new repository under the exact `docs/final/` paths.
3. Do not copy old application code, `migrations/`, `docs/handoffs/`, `docs/planning/`, old root planning files, or the old README into the new repository. The new build starts with no assumed code or completed STEP.
4. Add a short root `README.md` that points to `docs/final/START_HERE.md` and states that `docs/final/` is the sole active project specification. Do not point to old planning prompts.
5. Commit the six planning files and README, then select this new repository and its working branch in a new Arena coding chat.
6. For the first coding chat, write exactly: `Implement STEP 001`.

Suggested root `README.md` text:

```markdown
# KD SOLUTION IT

The active product scope, engineering rules, implementation sequence, production checklist and handoff template are maintained under `docs/final/`.
Start with `docs/final/START_HERE.md`. Do not use external or historical planning documents as active instructions.
```

## Resuming a repository that already has code
Do not restart at STEP 001. Inspect the selected branch and the contiguous `docs/handoffs/STEP_NNN_COMPLETED.md` sequence, read the latest handoff and implement only the next uncompleted STEP. Never infer completion from a chat statement alone; the selected branch's handoff and commit history are the record. Do not rewrite completed code, migrations, commits or handoffs.

If the old repository retains `docs/planning/` files that existing handoffs reference, preserve them. Mark them historical/background in `docs/planning/README.md` and in the root README. They may be consulted to understand a specific historical decision or handoff, but they are not active scope or coding instructions; current `docs/final/` files take precedence. Do not move or delete referenced historical files.

## One chat, one STEP
For every STEP, open a new coding chat with the same implementation repository and working branch selected. Write only `Implement STEP NNN` after verifying it is the next uncompleted STEP. The agent must read the six `docs/final/` files as applicable, the previous handoff, and the exact STEP block before coding. Complete one STEP, then verify its handoff before starting the next. Continue in strict numeric order through STEP 250.

Each STEP runs its ordered sub-steps within the same chat session; sub-steps are not separate chats. The STEP finishes with required verification, exactly one STEP commit, push and a completed `docs/handoffs/STEP_NNN_COMPLETED.md` copied from the template.

## If an Arena ownership or permission card appears
Use the STEP-specific File Ownership Rules first. If the requested paths are explicitly listed there, the permission is limited to those paths and behaviors. If the card still asks for permission, select “Revise options or write your own…” and enter the exact paths, reason and limit; a generic “Allow necessary shared changes” is not blanket permission. If no custom-text field is available, ask in chat before editing. For STEP 081, the plan pre-authorizes only MCC-specific onboarding/profile UI, MCC-only English catalog entries, the MCC-specific Zod/API integration using existing security guards, and the stated additive migration. It does not authorize refactoring generic auth/security code, changing `package.json`, editing earlier migrations or touching unrelated files. Record cross-path exceptions in the handoff.

## Database and secrets
A GitHub account/repository connection to Supabase alone does not guarantee migrations will run. Follow the explicitly configured and verified Supabase CLI/deployment procedure in `PRODUCTION_CHECKLIST.md`; verify target project, branch, migration history, staging and approval gates. Never paste database passwords, service-role keys, provider secrets or encryption keys into chat or commit them to Git.

## Completion checks
Before advancing, confirm the STEP handoff exists on the selected branch, lists exact files/migrations and cross-path exceptions, records rollback proof where a migration was added, and reports typecheck, lint, build and required behavior checks. A failed or missing check means the STEP is not complete; do not skip ahead.
