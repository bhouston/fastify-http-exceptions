<p align="center">
  <a href="https://npmjs.com/package/fastify-http-exceptions"><img src="https://img.shields.io/npm/v/fastify-http-exceptions.svg" alt="npm package"></a>
  <a href="https://www.npmtrends.com/fastify-http-exceptions"><img src="https://img.shields.io/npm/dw/fastify-http-exceptions.svg" alt="npm downloads"></a>
  <a href="https://codecov.io/gh/bhouston/fastify-http-exceptions"><img src="https://codecov.io/gh/bhouston/fastify-http-exceptions/branch/main/graph/badge.svg" alt="coverage"></a>
  <a href="https://discord.gg/fwupDN493R"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
</p>
<br/>

# Fastify HTTP Exceptions

> Throw typed HTTP exceptions in Fastify handlers, get proper responses.

- 🚨 Typed HTTP Exceptions
- 📦 Structured JSON Errors
- 🔁 Redirect Exceptions
- 🔌 One Fastify Plugin
- 🧰 Usable Without Fastify

A small, opinionated Fastify plugin and core library for typed HTTP exceptions. Throw HTTP exceptions with structured error payloads in your route handlers and have them converted into proper Fastify responses. See the [package README](packages/fastify-http-exceptions/README.md) for installation, usage, and options.

## Monorepo Layout

- **`packages/fastify-http-exceptions`**: core library and Fastify plugin.
- **`demos/basic-example`**: a demo Fastify app that uses the plugin.

You generally only need the published `fastify-http-exceptions` package, but the demo and tests live here as reference.

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

To run the demo app: `pnpm dev` (all dev targets in parallel) or `pnpm start` (basic-example).

## Releases

See [RELEASING.md](RELEASING.md) for how releases are published and [GitHub Releases](https://github.com/bhouston/fastify-http-exceptions/releases) for changes.

## Contribution

See [Contributing Guide](CONTRIBUTING.md).

## License

MIT

## Author

[Ben Houston](https://ben3d.ca), Sponsored by [Land of Assets](https://landofassets.com).
