# ADR-003 - Pin the submodule to an exact commit

**Context.**
Archify evolves. A submodule can be configured to follow a branch or to stay pinned to a specific commit.

**Decision.**
Pin the submodule to an exact commit. Updates are explicit and reviewed.

**Rationale.**
Reproducibility. A pipeline that validates and renders today must produce the same result six months from now. Following a branch would make builds depend on the state of the upstream repository at build time, which is not auditable.

The pinned commit is the record of which version of the validator and renderer produced a given artifact. For data and architectural governance, that traceability is not optional.

**Consequence.**
Updating Archify is a deliberate action:

```bash
git submodule update --remote vendor/archify
git add vendor/archify
git commit -m "Update Archify submodule"

That commit is part of the audit trail.