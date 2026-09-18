# Contributing

This is the shared workflow standard for people, Claude, and Codex. Agent instruction files point here; keep workflow rules in this file.

## Issue → branch → PR

1. Before implementing a feature, fix, or improvement, open or reuse a GitHub issue. Use the feature/improvement template: description and motivation, acceptance criteria, and constraints. With `gh issue create`, include those same sections in the body.
2. Fetch `origin`, start from `origin/main`, and create `<type>/<issue>-<slug>`, for example `feature/42-batch-export`. Allowed branch types: `feature`, `fix`, `docs`, `chore`, `refactor`, `test`.
3. Implement and validate the change. Never commit directly to `main`. Keep unrelated workspace edits out of commits.
4. Use Conventional Commits for every commit: `type(scope): description`. Scope is optional. Use `feat` for minor releases, `fix` for patches, and `!` after the type/scope or a `BREAKING CHANGE:` footer for major releases. `docs`, `chore`, `refactor`, `test`, `style`, `perf`, `build`, `ci`, and `revert` are also supported. `perf` triggers a patch; ordinary docs/chore/refactor/test/style/build/ci changes do not trigger releases. Reference the issue in the body when useful.
5. Open a PR against `main`. Use a Conventional Commit title and include `Closes #42` for the branch's issue. Explain the behavior and validation. CI checks the branch name, closing reference, PR title, and every commit message. Resolve failures before merging.
6. Merge PRs into `main` with a merge commit; do not squash or rebase-merge. Keep a Conventional Commit PR title and put any breaking-change footer in the PR description. Merging does not publish; releases are triggered separately (see below).

## Local checks

Use Node from `.nvmrc` and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm tsc
pnpm lint
pnpm test:coverage
pnpm audit --audit-level high
pnpm size
pnpm --filter fastify-http-exceptions pack --dry-run
```

`pnpm install` installs Husky hooks. Pre-commit formats/lints staged files and checks types; commit-msg rejects invalid Conventional Commits. CI supplies enforcement if local hooks are bypassed. Coverage must reach 95% for statements, branches, functions, and lines over library source, including untested source files. Size-limit caps the prepared package's JavaScript at 8 kB gzip, excluding dependencies. Any intentional limit change needs an explanation in the PR. Dependency auditing fails for high or critical findings, including development dependencies.

## Controlled releases

Ordinary work accumulates on `main` through reviewed PRs; merging never publishes. When ready, a maintainer manually dispatches the release workflow:

```sh
gh workflow run release.yml --ref main
```

This can only run against `main`; `release.yml` rejects dispatches against any other ref before doing anything privileged. Pass `-f dry_run=true` to validate and preview a release (changelog, next version) without publishing — useful after workflow or policy changes.

`.github/workflows/release.yml` reruns all quality gates before the publishing job. Semantic-release computes versions from Conventional Commits since the last `v*` tag, publishes the prepared package through npm OIDC, tags the release, and creates a GitHub Release with generated notes, a tarball, and a per-release `CHANGELOG.md`. Each npm tarball also includes that changelog. The GitHub Releases page is the cumulative changelog; version and changelog changes are generated in CI and are not committed back to `main`. The source manifest is a development baseline, not the authoritative latest published version. If there are no release-worthy commits since the last tag, the dispatch is a successful no-op.

The existing npm `1.3.0` release is anchored by `v1.3.0` at npm's recorded gitHead, `294e656ba9a5b34e44e92d233ac06a747fa8f2d6`. Existing nonconventional history is not rewritten.

### One-time maintainer setup

1. Open the npm settings for **fastify-http-exceptions** → Trusted Publisher → GitHub Actions. Enter:
   - Organization or user: `bhouston`
   - Repository: `fastify-http-exceptions`
   - Workflow filename: `release.yml` (filename only)
   - Environment: `npm`
2. In GitHub Settings → Environments, create/configure `npm`, restrict deployment branches to `main`, and optionally require a reviewer. This name must match npm and the workflow exactly.
3. Protect `main` with required PRs and the `Quality` check (select the actual check context shown by Actions); disable force pushes and branch deletion. Keep `main` as the default branch. `dev` is retired for ordinary work; leave it in place rather than deleting it until nothing references it.
4. Configure `CODECOV_TOKEN` for reliable coverage uploads and the README coverage badge. Coverage thresholds are enforced locally in CI even if Codecov is unavailable.
5. Validate the workflow with a dry run (`gh workflow run release.yml --ref main -f dry_run=true`) before the first real dispatch. Check the Actions run, npm version/provenance, and GitHub release assets on a real dispatch. A real publish cannot be validated locally; no npm token secret is required.

The workflow uses GitHub-hosted runners and `id-token: write` for [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), performed via `pnpm publish` (through `@anolilab/semantic-release-pnpm`) rather than `npm publish`. GitHub's built-in `GITHUB_TOKEN` creates tags and releases; no personal access token is needed. See the [semantic-release GitHub Actions guidance](https://semantic-release.gitbook.io/semantic-release/recipes/ci-configurations/github-actions).

## Reusing this standard

After the first successful publish, extract CONTRIBUTING.md, agent pointers, templates, commitlint/Husky setup, quality gates, and release configuration into a dedicated GitHub template repository. Keep repository-specific URLs, package paths, supported runtimes, coverage baselines, and size budgets configurable. For existing repositories, copy those files on an issue branch and install their dev dependencies; establish the last published version tag before enabling releases. Never overwrite an existing LICENSE or security contact during rollout. The separate template repository and multi-repository rollout are follow-up work after validating this pilot.
