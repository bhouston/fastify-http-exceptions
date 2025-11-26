# fastify-http-exceptions

[![NPM Package][npm]][npm-url]
[![NPM Downloads][npm-downloads]][npmtrends-url]
[![Tests][tests-badge]][tests-url]
[![Coverage][coverage-badge]][coverage-url]

A Fastify plugin and core utilities for typed HTTP exceptions. Provides a small, opinionated HTTP exception model that plays nicely with Fastify but is not tightly coupled to it.

## Installation

```bash
pnpm add fastify-http-exceptions fastify zod
```

## Usage

### Register the plugin

```ts
import Fastify from 'fastify';
import { fastifyHttpExceptions } from 'fastify-http-exceptions';
import { NotFoundException } from 'fastify-http-exceptions/core';
import * as z from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const app = Fastify();

await app.register(fastifyHttpExceptions);

app.get('/users/:id', async (request, reply) => {
  const id = (request.params as { id: string }).id;
  const user = await findUser(id);

  if (!user) {
    throw new NotFoundException('user');
  }

  const safeUser = UserSchema.parse(user);
  return reply.send(safeUser);
});
```

### Core-only usage

If you only want the core HTTP exception helpers without Fastify, import from the `core` entry:

```ts
import { HTTPException, NotFoundException } from 'fastify-http-exceptions/core';
```

[npm]: https://img.shields.io/npm/v/fastify-http-exceptions
[npm-url]: https://www.npmjs.com/package/fastify-http-exceptions
[npm-downloads]: https://img.shields.io/npm/dw/fastify-http-exceptions
[npmtrends-url]: https://www.npmtrends.com/fastify-http-exceptions
[tests-badge]: https://github.com/bhouston/fastify-http-exceptions/workflows/Tests/badge.svg
[tests-url]: https://github.com/bhouston/fastify-http-exceptions/actions/workflows/test.yml
[coverage-badge]: https://codecov.io/gh/bhouston/fastify-http-exceptions/branch/main/graph/badge.svg
[coverage-url]: https://codecov.io/gh/bhouston/fastify-http-exceptions

