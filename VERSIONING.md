# Versioning And PR Workflow

Hey Mark starts at `v0.0.1` and uses Semantic Versioning.

## Version Rules

- `MAJOR`: breaking product, API, data contract, deployment, or user workflow changes.
- `MINOR`: new user-facing capabilities that are backward compatible.
- `PATCH`: bug fixes, copy fixes, small UI adjustments, docs clarifications, and internal maintenance.

While the product is pre-1.0, changes can still be fast, but version bumps must describe impact clearly.

## Work Size Mapping

| Work size | SemVer bump | Examples |
| --- | --- | --- |
| Small fix | `PATCH` | typo, layout bug, answer wording, validation fix |
| Additive feature | `MINOR` | new cafe input, new strategy section, new derived knowledge card |
| Contract shift | `MAJOR` | API shape change, auth model, database/RAG migration, provider change |

## Required Workflow

Every work item must go through a PR:

1. Create a branch from `main`.
2. Make the change.
3. Update `package.json`, `package-lock.json`, and `CHANGELOG.md` when the change ships.
4. Run required checks.
5. Push the branch.
6. Open a PR.
7. Squash merge after checks/review.
8. Tag the merged `main` commit when releasing.

Direct commits to `main` are reserved only for emergency recovery and should be followed by a retroactive PR or issue note.

## PR Requirements

Every PR should include:

- Problem or reason for the change
- Summary of changes
- Version bump type: `major`, `minor`, or `patch`
- Testing evidence
- Deployment or rollback notes when relevant

## Tagging

Use annotated tags:

```bash
git tag -a v0.0.1 -m "v0.0.1"
git push origin v0.0.1
```

Only tag commits that are already merged into `main`.

