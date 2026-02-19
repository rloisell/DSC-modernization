# Next Steps — Build the Spec-Kitty Project

This document outlines the high-level steps to build the Spec-Kitty spec for this repository, the data you should prepare, and quick links to relevant documentation and examples.

**Goal:** produce and validate a Spec-Kitty project workspace (features, missions, artifacts) that can be used to orchestrate implementation and integration tasks.

**High-level steps**

- 1) Verify environment
  - Ensure `spec-kitty` CLI is installed and available in your PATH (`which spec-kitty`).
  - Run `spec-kitty verify-setup` to confirm required tools and note any missing AI assistants or IDE integrations.

- 2) Add project metadata
  - Run `spec-kitty upgrade` at the repo root to create the `.kittify/metadata.yaml` and related scaffolding the CLI expects.

- 3) Specify features (create the Spec)
  - Use `spec-kitty specify` to create one or more feature specifications. Each feature should include:
    - A short title and unique id
    - A clear value statement / outcome (why it matters)
    - Acceptance criteria (concrete, testable)
    - Phase / mission selection (e.g., `software-dev`)
    - Any required design assets or API contracts

- 4) Prepare feature artifacts and data
  - For each feature provide:
    - Detailed acceptance criteria and test cases
    - Example requests/responses for any API work
    - Sample data (DB schema, seed data) and credentials for local development (do NOT commit secrets)
    - Any design mockups, diagrams or decision records

- 5) Run agent workflows (optional) or implement manually
  - For agentic work: `spec-kitty orchestrate` will run the Spec-Kitty orchestration (or use `spec-kitty agent` commands).
  - For manual work: follow the `implement` steps produced by `spec-kitty specify` and create a feature branch per feature.

- 6) Validate and merge
  - Use `spec-kitty accept` and `spec-kitty merge` to validate readiness and merge completed features.

**Data & access you must provide**

- Feature-level content: descriptive text, acceptance criteria, success metrics.
- Example API contracts (OpenAPI/Swagger), sample request/response JSON.
- Local dev credentials and seed data for MariaDB (store secrets externally; use env vars or `.env` files excluded from git).
- CI access / GitHub tokens if you plan to integrate automated agent workflows that need push/PR permissions.
- Any third-party API keys or cloud resource credentials (use ephemeral/test keys).

**Commands (quick reference)**

```bash
# Show setup status
spec-kitty verify-setup

# Add project metadata (upgrade to current spec-kitty layout)
spec-kitty upgrade

# Interactively create a feature/spec
spec-kitty specify

# Show missions and context
spec-kitty mission
spec-kitty context

# Orchestrate agent-driven implementation (careful: may modify repo/worktrees)
spec-kitty orchestrate

# Validate and merge
spec-kitty accept
spec-kitty merge
```

**Relevant links & reading**

- Spec-Kitty repository (fork we're using): https://github.com/Priivacy-ai/spec-kitty
- Spec-Kitty README & CLI reference: (see the repo README and `spec-kitty --help` locally)
- Original GitHub Spec Kit (concepts, examples): https://github.com/github/spec-kit
- Spec-driven design resources and examples:
  - Spec-driven development primer: https://github.com/github/spec-kit (examples in `spec-kit` templates)

**Notes & recommendations**

- Start small: create a single simple feature with tight acceptance criteria to validate the workflow.
- Avoid committing secrets; use env variables and document required vars in feature artifacts.
- If you plan to run autonomous agents (`orchestrate`), ensure you understand the permissions they will require — run in a throwaway branch/worktree first.

If you want, I can proceed to run `spec-kitty upgrade` and then `spec-kitty specify` interactively to scaffold a sample feature — tell me whether you prefer to author the initial feature text or have me draft it.

***
Generated: 2026-02-19 — tracked in `AI/WORKLOG.md`.

Update (2026-02-19): Scaffolding

- I ran `spec-kitty upgrade` to migrate project metadata to the current Spec-Kitty layout.
- I added a sample feature scaffold at `kitty-specs/001-modernize-api/` containing `spec.md` and `tasks.md`. Use this directory as a template to populate acceptance criteria, sample requests, and seed data as you research.

Paths to review:
- Feature scaffold: `kitty-specs/001-modernize-api/spec.md`
- Tasks: `kitty-specs/001-modernize-api/tasks.md`
- Project metadata: `.kittify/`

Next recommended actions:
- Fill `spec.md` with example JSON and DB seed files under `spec/fixtures/`.
- When ready, run `spec-kitty orchestrate` in a disposable worktree to validate agent workflows.

