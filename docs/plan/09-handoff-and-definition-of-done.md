// path: docs/plan/09-handoff-and-definition-of-done.md

# 09 - HANDOFF AND DEFINITION OF DONE

## 1. Definition of done for every sub-step

1. Every file starts with `// path: <path>` and contains complete code.
2. TypeScript strict passes with no `any` and no suppression comments.
3. Zod validation on client and server for every input; sanitization applied.
4. Service layer holds transaction, audit, idempotency and optimistic locking.
5. RLS policy and audit trigger exist for every new table, with a down migration.
6. All four UI states implemented, responsive at 320 pixels, keyboard accessible,
   dark mode correct, English only.
7. Structured logging with correlation id; no `console.log`.
8. Rate limit and CSRF protection on every new mutating endpoint.
9. `.env.example` updated for every new variable, with a comment per variable.
10. `docs/plan/04-data-model-map.md` updated in the same commit for every new table.
11. `npm run verify` green.
12. Conventional commit made, message naming the sub-step.

## 2. Definition of done for every step

1. All sub-steps complete and committed.
2. Migration range applied forward and rolled back cleanly, then applied again.
3. Guard scripts pass; no file exceeds 500 lines; no function exceeds 50 lines.
4. Security review against `07-security-zero-trust-lr022.md` recorded with findings.
5. Performance spot check on the step's own pages.
6. Handoff document written and committed.
7. Tag `step-XX-done` pushed.
8. Change requests for other steps listed explicitly.

## 3. Handoff document format

File: `handoffs/STEP_XX_COMPLETED.md`

```
// path: handoffs/STEP_XX_COMPLETED.md

# STEP XX COMPLETED - <title>

## Scope delivered
- sub-step id, one line each

## Files created
## Files modified
## Tables created
## Migrations added (sequence range)
## API routes added
## Permissions added
## Feature flags added
## Environment variables added
## Dependencies added
## Tests executed manually (cases and results)
## Security review findings and fixes
## Known limitations with the reason and the plan
## Change requests for other steps
| Target step | File or table | Change needed | Reason |
## Starting point for STEP XX+1
- exact sub-step, exact files to open first
```

## 4. Self-audit commands

`package.json` scripts, all implemented in STEP 01 and extended only in STEP 16:

```
verify              lint + type-check + all guards
guard:english       no non-ASCII characters anywhere in tracked text files
guard:no-tests      fails if any .test.ts or .spec.ts or tests directory exists
guard:no-todo       fails on TODO, FIXME, Coming Soon, placeholder markers
guard:path-comment  every source file starts with the path comment
guard:no-any        fails on any usage of the any type
guard:money         fails on Number or parseFloat used on money identifiers
guard:console       fails on console usage outside the logger
db:up / db:down     applies or rolls back the current step migration range
db:verify           checks every table for id, company_id, timestamps, RLS, trigger
```

## 5. Review checklist for the person merging the step

- Does the diff stay inside the step's owned paths.
- Are table names unique and present in the data model map.
- Are migration numbers inside the reserved range and unused.
- Does any registry file owned by another step have a direct edit.
- Is every new endpoint protected by RBAC, rate limit and CSRF where applicable.
- Is every new provider adapter backed by a verification record.
- Are money columns `numeric(18,4)` and money logic decimal-only.
- Is every new user-facing string in English and in the central string file where
  the rule applies.
- Does the handoff list the next starting point and the change requests.

## 6. Repository state discipline

- `main` is the integration branch and stays deployable.
- Each step is a branch `step/XX-slug` with a pull request to `main`.
- A step's pull request links its handoff document.
- Any fix to a merged step is a separate `fix/` branch with its own handoff note,
  never a silent edit inside a later step.
