// path: docs/final/START_HERE.md
# KD SOLUTION IT - Start Here

## Preflight: prevent legacy-plan conflicts
Before coding, confirm the selected implementation repository contains all six authoritative files under `docs/final/` and its root `README.md` identifies them as the sole active instructions. The existing `kd-solution-it` repository also contains legacy `docs/planning/` files, including old chat prompts that instruct agents to read a different plan. Preserve them in Git history, but archive/remove them from the active instruction paths (or replace them with a clear historical-only notice) and update the root README before coding. Do not let any old root planning file, old 80-chat README or `docs/planning/` prompt compete with `docs/final/`. If conflicting instructions remain or any authoritative file is inaccessible, stop; do not guess or code.

## What lives in this repository
- docs/final/FEATURE_LIST.md: the single complete feature list. This is the only scope document.
- docs/final/MASTER_PROMPT.md: the rules every coding chat must follow.
- docs/final/STEP_PLAN_250.md: the project split into 250 small steps, one step per chat.
- docs/final/PRODUCTION_CHECKLIST.md: accounts, environment variables, email domain, payment live readiness and the go-live sequence needed to run the finished project as a business.
- docs/final/HANDOFF_TEMPLATE.md: the fixed template every chat copies to docs/handoffs/STEP_NNN_COMPLETED.md and fills completely.
- docs/handoffs/: one completion file per finished STEP, created by the chat that finished it.

## How to resume an in-progress implementation
If the repository already contains completed work, do not restart at STEP 001 and do not overwrite completed code, migrations, commits or handoffs. Read the latest handoff and inspect the contiguous `docs/handoffs/STEP_NNN_COMPLETED.md` sequence on the selected branch; implement only the next uncompleted STEP. The owner reports STEPs 001-080 complete, so the expected next STEP is 081; verify that STEP_080 handoff exists on the selected branch before proceeding. If it does not, stop and reconcile progress rather than skipping.

## How the owner runs the build
1. Keep all six authoritative documents inside the GitHub repository that holds the project code, after completing the preflight above.
2. Open a new coding chat with the correct repository and working branch selected.
3. For a genuinely new project with no completed handoffs, write: `Implement STEP 001`.
4. For an existing project, read the last completed handoff and verify the contiguous handoff sequence on that selected branch. Implement only the next uncompleted STEP; never restart at 001 or skip missing handoffs.
5. For this amendment, the owner reports STEPs 001-080 complete. Proceed with `Implement STEP 081` only if `docs/handoffs/STEP_080_COMPLETED.md` exists on the selected branch and STEPs 001-080 are contiguous. If the branch is behind that checkpoint, stop and reconcile the correct branch/progress first.
6. The agent reads the authoritative files and previous handoff, completes exactly one STEP, runs required verification, commits/pushes and creates that STEP's handoff. Continue numerically, one new chat per STEP, through STEP 250.

## Why no long instruction needs to be pasted
The repository is selected in the chat, so the agent has direct access to the feature list,
the master rules and the step plan. The single line "Implement STEP NNN" is enough because
MASTER_PROMPT.md instructs the agent to read everything from the repository, check the
previous handoff, stay inside the scope of that one STEP, and leave a handoff for the next chat.

## Golden rules for the whole build
- FEATURE_LIST.md is the only scope. If a STEP line and the feature list ever differ,
  the feature list wins.
- One chat, one STEP, one commit, one handoff file.
- package.json changes happen only through package requests written in handoff files.
- Migrations are append-only and are never edited after they are committed.
