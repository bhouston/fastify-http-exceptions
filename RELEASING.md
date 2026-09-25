# Releases

## Local checks

Coverage must reach 95% for statements, branches, functions, and lines over library source, including untested source files (`pnpm test:coverage`). Size-limit caps the prepared package's JavaScript at 8 kB gzip, excluding dependencies (`pnpm size`). Any intentional limit change needs an explanation in the PR. Dependency auditing (`pnpm audit --audit-level high`) fails for high or critical findings, including development dependencies.

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
