## fastify-http-exceptions

[![NPM Package][npm]][npm-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]
[![Tests][tests-badge]][tests-url]
[![Coverage][coverage-badge]][coverage-url]

**`fastify-http-exceptions`** is a small, opinionated Fastify plugin and core library for **typed HTTP exceptions**.

It lets you **throw HTTP exceptions with structured error payloads** in your route handlers and have them **automatically converted into proper Fastify responses**.  
The core utilities are framework‑agnostic; the Fastify plugin was created out of real‑world need to simplify error handling in larger APIs.

### Features

- **Typed HTTP exception hierarchy**: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, and many more.
- **Consistent JSON error bodies**: 4xx/5xx errors are serialized as `{ error: string }`.
- **Redirect support**: throw `TemporaryRedirectException` or `PermanentRedirectException` to drive redirects from your domain logic.
- **Fastify integration**: a single plugin wraps Fastify’s error handler and converts exceptions into responses.
- **Core-only helpers**: use the exception model without Fastify in other Node.js frameworks.

> **Runtime requirements:** Node.js `>= 24` and Fastify `^5.0.0`. This is an **ESM-only** package.

---

## Installation

```sh
pnpm add fastify-http-exceptions fastify
```

---

## Basic Usage with Fastify

Register the plugin once, then throw HTTP exceptions from your routes:

```ts
import Fastify from 'fastify';
import { fastifyHttpExceptions } from 'fastify-http-exceptions';
import {
  NotFoundException,
  ForbiddenException,
} from 'fastify-http-exceptions/core';

const app = Fastify();

await app.register(fastifyHttpExceptions, {
  // Optional: log unhandled (non-HTTPException) errors via fastify.log.error
  logUnhandled: true,
});

app.get('/users/:id', async (request, reply) => {
  const id = (request.params as { id: string }).id;

  const user = await findUser(id);
  if (!user) {
    // Will become: 404 + { "error": "user not found" }
    throw new NotFoundException('user');
  }

  if (!canAccessUser(request, user)) {
    // Will become: 403 + { "error": "Access denied to user: missing permission" }
    throw new ForbiddenException('user', 'missing permission');
  }

  return reply.send(user);
});
```

### Redirects from Handlers

You can also throw redirect exceptions and let the plugin turn them into Fastify `redirect()` calls:

```ts
import { TemporaryRedirectException } from 'fastify-http-exceptions/core';

app.get('/old-endpoint', async () => {
  throw new TemporaryRedirectException('/new-endpoint');
});
```

This results in a redirect response using the appropriate HTTP status code.

---

## Error Response Shape

When an `HTTPException` (or compatible error) is thrown inside a Fastify route:

- **Redirect exceptions** (`TemporaryRedirectException`, `PermanentRedirectException`) are translated into Fastify redirects.
- For 4xx/5xx HTTP error codes, responses are shaped as:

```json
{
  "error": "Human-readable message"
}
```

The conversion logic is handled by `httpExceptionToResponse`, which is used internally by the Fastify plugin.

---

## Core-Only Usage (No Fastify)

If you want to reuse the typed HTTP exceptions without the Fastify plugin, import from the `core` entry:

```ts
import {
  HTTPException,
  NotFoundException,
  ForbiddenException,
  httpExceptionToResponse,
  isHTTPException,
} from 'fastify-http-exceptions/core';

function getUserOrThrow(id: string) {
  const user = findUserSync(id);
  if (!user) {
    throw new NotFoundException('user');
  }
  return user;
}

try {
  const user = getUserOrThrow('123');
  // ...
} catch (err) {
  if (isHTTPException(err)) {
    const response = httpExceptionToResponse(err);
    // Integrate with your own HTTP server / framework here
  } else {
    // Fallback: log or convert to 500, etc.
  }
}
```

This works in any Node.js HTTP framework or even in pure Node HTTP servers.

---

## Fastify Plugin Options

The `fastify-http-exceptions` plugin accepts a small options object:

- **`logUnhandled?: boolean`**
  - When `true`, non-`HTTPException` errors are logged via `fastify.log.error` before being passed to the original Fastify error handler.
  - Default: `false`.

Example:

```ts
await app.register(fastifyHttpExceptions, {
  logUnhandled: true,
});
```

---

## Monorepo Layout

This repository is a small monorepo:

- **`packages/fastify-http-exceptions`**: core library and Fastify plugin.
- **`demos/basic-example`**: a demo Fastify app that uses the plugin.

You generally only need the published `fastify-http-exceptions` package, but the demo and tests live here as reference.

---

## Plugin Development (for Contributors)

If you want to contribute or run the plugin locally:

```sh
# from the repo root
pnpm install

# type-check all packages
pnpm tsc

# run Biome checks (format + lint)
pnpm check

# build all packages
pnpm build
```

To run the demo app:

```sh
pnpm dev          # run all dev targets in parallel
pnpm start        # start the basic-example demo
```

You can also work directly inside the package:

```sh
cd packages/fastify-http-exceptions

pnpm tsc         # one-off type-check
pnpm dev         # watch mode
pnpm vitest      # run unit tests
```

---

## Publishing

**IMPORTANT:** Always publish via the **monorepo root** using the `publish` script, **not** via `pnpm publish` directly inside the package directory.

From the repository root:

```sh
pnpm publish
```

This will:

- Build the package.
- Copy `LICENSE` and this root `README.md` into the package’s publish folder.
- Publish the package to npm with the correct metadata and README.

After publishing, remember to push commits and tags:

```sh
git push
git push --tags
```

---

## Motivation

This plugin was born out of the practical need to **standardize HTTP error handling in Fastify APIs**:

- Application code should be able to express failures with **simple, typed exceptions**.
- The HTTP layer should consistently return **structured JSON responses** without repetitive boilerplate.
- The same exception model should be useful **inside and outside of Fastify**.

If you have suggestions, issues, or ideas for additional exception helpers, please open an issue or PR.

---

[npm]: https://img.shields.io/npm/v/fastify-http-exceptions
[npm-url]: https://www.npmjs.com/package/fastify-http-exceptions
[npm-downloads]: https://img.shields.io/npm/dw/fastify-http-exceptions
[npmtrends-url]: https://www.npmtrends.com/fastify-http-exceptions
[tests-badge]: https://github.com/bhouston/fastify-http-exceptions/workflows/Tests/badge.svg
[tests-url]: https://github.com/bhouston/fastify-http-exceptions/actions/workflows/test.yml
[coverage-badge]: https://codecov.io/gh/bhouston/fastify-http-exceptions/branch/main/graph/badge.svg
[coverage-url]: https://codecov.io/gh/bhouston/fastify-http-exceptions
