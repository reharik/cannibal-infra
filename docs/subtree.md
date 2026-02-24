# cannibal-infra: Git Subtree Usage

This doc describes how app repos consume cannibal-infra via git subtree at `/infra`.

## Add infra to an app repo (first time)

```bash
# Add cannibal-infra as a remote (optional; use a name like 'infra')
git remote add infra <cannibal-infra-repo-url>

# Pull infra into the repo at prefix /infra
git subtree add --prefix=infra infra main --squash
```

Replace `<cannibal-infra-repo-url>` with the actual repo URL (e.g. `git@github.com:org/cannibal-infra.git`).

## Update infra from cannibal-infra repo

After cannibal-infra is updated, pull the latest into the app repo:

```bash
git subtree pull --prefix=infra infra main --squash
```

## Push app-specific changes to cannibal-infra (if allowed)

If you make changes under `infra/` that should go back to cannibal-infra:

```bash
git subtree push --prefix=infra infra main
```

In practice, infra changes are usually made in the cannibal-infra repo and then pulled into app repos via `subtree pull`.

## Paths in app repo

- Scripts: `./infra/scripts/deploy/`, `./infra/scripts/remote/`, `./infra/scripts/local/`
- Workflows: `./.github/workflows/` in the app repo typically call or reference `./infra/github/workflows/` (or copy patterns from there)
- Config: apps extend `./infra/config/eslint/`, `./infra/config/prettier/`, `./infra/config/tsconfig/` as needed

## Notes

- Using `--squash` keeps app repo history cleaner; omit it if you want full infra history.
- Ensure the app repo's `.gitignore` does not ignore the `infra/` directory (it is tracked like any other path).
