# fastify-http-exceptions

A Fastify plugin and core utilities for typed HTTP exceptions and responses. Provides a small, opinionated HTTP exception / response model that plays nicely with Fastify but is not tightly coupled to it.

## Installation

```bash
pnpm add fastify-http-exceptions fastify zod
```

## Usage

### Register the plugin

```ts
import Fastify from 'fastify';
import fastifyHttpExceptions, { NotFoundException, ok } from 'fastify-http-exceptions';
import * as z from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const app = Fastify();

await app.register(fastifyHttpExceptions);

app.get('/users/:id', async (request, reply) => {
  const user = null; // fetch user
  if (!user) {
    throw new NotFoundException('user');
  }
  return ok(UserSchema, user);
});
```

### Core-only usage

If you only want the core HTTP helpers without Fastify, import from the `core` entry:

```ts
import { HTTPException, NotFoundException, ok } from 'fastify-http-exceptions/core';
```


