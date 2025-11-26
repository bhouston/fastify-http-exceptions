# fastify-http-exceptions

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

