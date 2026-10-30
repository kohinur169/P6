// path: handoffs/README.md

# HANDOFFS

One document per completed step: `STEP_01_COMPLETED.md` to `STEP_16_COMPLETED.md`.

The handoff is the only accepted proof that a step is finished. It is written before
the step branch is merged and before the tag `step-XX-done` is pushed.

Required sections, in order:

1. Scope delivered, one line per sub-step
2. Files created
3. Files modified
4. Tables created
5. Migrations added, with sequence numbers
6. API routes added
7. Permissions and feature flags added
8. Environment variables added
9. Dependencies added
10. Manual test cases executed and their results
11. Security review findings and how each was fixed
12. Known limitations, with the reason and the plan
13. Change requests for other steps, as a table
14. Starting point for the next step, naming the exact sub-step and files

Format reference: `docs/plan/09-handoff-and-definition-of-done.md`.
