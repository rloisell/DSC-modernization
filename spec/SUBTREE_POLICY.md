# Spec Kit Subtree Policy

This repository vendors the Spec Kit as a git subtree at `spec/spec-kit`.

Policy:
- Add or update the Spec Kit using `git subtree` so contributors do not need
  to manage submodules.
- To pull upstream changes:

```bash
git fetch spec-upstream
git subtree pull --prefix=spec/spec-kit spec-upstream main --squash
```

- To push local changes back upstream (rare) use subtree push or submit a PR
  to the Spec Kit repo.

Documentation: record the upstream repository URL and commit in `AI/COMMIT_INFO.txt`.
