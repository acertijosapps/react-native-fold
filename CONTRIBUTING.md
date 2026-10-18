# Contributing

Contributions are welcome. Keep changes small, focused, and traceable.

## Development workflow

This project is a monorepo managed with [Yarn workspaces](https://yarnpkg.com/features/workspaces):

- The library package in the root directory.
- An example app in the `example/` directory.

Use the Node.js version in [`.nvmrc`](./.nvmrc). Install dependencies from the root:

```sh
yarn
```

`yarn` also wires the repository git hooks (`core.hooksPath` → `.githooks/`) and builds the library.

> The project relies on Yarn workspaces; `npm` is not supported for development.

The example app uses the local version of the library, so source changes are reflected there. JavaScript changes hot-reload; native changes require a rebuild.

To edit the native code in an IDE, open `example/ios/FoldExample.xcworkspace` in Xcode (sources under `Pods > Development Pods > Fold`) or `example/android` in Android Studio (sources under `react-native-fold`).

### Commands

```sh
yarn example start      # start the Metro bundler
yarn example android    # run the example on Android
yarn example ios        # run the example on iOS
yarn typecheck          # type-check with TypeScript
yarn lint               # lint with ESLint
yarn lint --fix         # fix formatting
yarn test               # run the Jest suite
```

## Branching model

Two permanent branches, both protected:

- **`main`** — production. No direct pushes; changes land only through an approved Merge Request.
- **`beta`** — release candidate.

Temporary branches, always created from `beta`, in kebab-case:

- `feat/<name>` · `fix/<name>` · `chore/<name>` → Merge Request **into `beta`**, deleted after merge.
- `hotfix/<name>` is the only exception: created from `main`, MR into `main`, then back-merged into `beta`.

One branch = one focused change.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>)(!): <imperative description>
```

Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`.

[SemVer](https://semver.org/) mapping: `feat` → MINOR, `fix` → PATCH, breaking (`feat!` or `BREAKING CHANGE:`) → MAJOR.

The git hooks in [`.githooks/`](./.githooks) run for every commit:

- `commit-msg` rejects messages that are not Conventional Commits.
- `pre-commit` blocks direct commits on `main` and `beta`.

One-off bypass (not recommended): `git commit --no-verify`.

## Changelog

Any change that affects behavior updates [`CHANGELOG.md`](./CHANGELOG.md) ([Keep a Changelog](https://keepachangelog.com/)): add the entry under `## [Sin liberar]` in the right category (Añadido · Cambiado · Corregido · Eliminado).

## Merge Requests

When opening an MR:

- Target `beta` (or `main` only for `hotfix`).
- Keep it small and focused on one change.
- Assign at least one reviewer; merge requires their approval.
- Link the related work item for traceability.
- Gates must be green: `yarn typecheck`, `yarn lint`, `yarn test`.
- Include the `CHANGELOG.md` entry.

## Releasing (`beta` → `main`)

1. Confirm gates are green on `beta`.
2. Decide the SemVer bump from the commits since the last tag.
3. Update `version` in `package.json`.
4. Rename the `## [Sin liberar]` section of the changelog to `## [X.Y.Z] - YYYY-MM-DD` and open a fresh empty one.
5. Tag `vX.Y.Z` on `main`.
