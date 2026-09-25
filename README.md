# Fastify HTTP Exceptions

[![NPM Package][npm]][npm-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]
[![Tests][tests-badge]][tests-url]
[![Coverage][coverage-badge]][coverage-url]
[![Discord][discord-badge]][discord-url]

**`fastify-http-exceptions`** is a small, opinionated Fastify plugin and core library for **typed HTTP exceptions**. It lets you throw HTTP exceptions with structured error payloads in your route handlers and have them automatically converted into proper Fastify responses. The core utilities are framework-agnostic; the Fastify plugin was created out of real-world need to simplify error handling in larger APIs.

See [packages/fastify-http-exceptions/README.md](packages/fastify-http-exceptions/README.md) for full documentation.

---

## Monorepo Layout

This repository is a small monorepo:

- **`packages/fastify-http-exceptions`**: core library and Fastify plugin.
- **`demos/basic-example`**: a demo Fastify app that uses the plugin.

You generally only need the published `fastify-http-exceptions` package, but the demo and tests live here as reference.

---

## Development

```bash
pnpm install
pnpm dev
pnpm tsc
pnpm build
pnpm lint # oxlint
pnpm lint:fix
pnpm format # oxfmt
pnpm test # vitest
```

To run the demo app: `pnpm dev` (all dev targets in parallel) or `pnpm start` (basic-example). See [CONTRIBUTING.md](CONTRIBUTING.md) for the issue/PR workflow and [RELEASING.md](RELEASING.md) for release setup. Releases are published by manually running the `Release` workflow on `main`.

## Author

[Ben Houston](https://ben3d.ca), Sponsored by [Land of Assets](https://landofassets.com)

[npm]: https://img.shields.io/npm/v/fastify-http-exceptions
[npm-url]: https://www.npmjs.com/package/fastify-http-exceptions
[npm-downloads]: https://img.shields.io/npm/dw/fastify-http-exceptions
[npmtrends-url]: https://www.npmtrends.com/fastify-http-exceptions
[tests-badge]: https://github.com/bhouston/fastify-http-exceptions/actions/workflows/ci.yml/badge.svg
[tests-url]: https://github.com/bhouston/fastify-http-exceptions/actions/workflows/ci.yml
[coverage-badge]: https://codecov.io/gh/bhouston/fastify-http-exceptions/branch/main/graph/badge.svg
[coverage-url]: https://codecov.io/gh/bhouston/fastify-http-exceptions
[discord-badge]: https://img.shields.io/badge/Discord-Join%20Chat-5865F2?logo=discord&logoColor=white
[discord-url]: https://discord.gg/fwupDN493R
