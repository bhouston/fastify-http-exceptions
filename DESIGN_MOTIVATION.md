## Fastify HTTP Exception Module – Design & Implementation Plan

### 1. Goals

- **Provide a small, opinionated HTTP exception / response model** that plays nicely with Fastify but is not tightly coupled to it.
- **Make it trivial for Fastify users to adopt**:
  - Throw typed HTTP exceptions in route handlers.
  - Optionally return typed HTTP response objects.
  - Let a **Fastify plugin** handle conversion to real Fastify replies.
- **Keep the core module “pure”** (no Fastify dependency), with a thin Fastify adapter.
- **Enable reuse outside Fastify** (e.g., tests, other frameworks) via the core types and helpers.

Proposed package name (for npm): **`fastify-http-exceptions`**.

Internally this package will expose:
- A **core module** (no Fastify dependency).
- A **Fastify integration module** (exports the plugin and helpers).

Example entrypoints:
- `fastify-http-exceptions` → main entry (Fastify plugin + re-export core types).
- `fastify-http-exceptions/core` → pure HTTP exception utilities (no Fastify).

---

### 2. Review of Current Design

Current files:
- `packages/backend/src/http/httpException.ts`
- `packages/backend/src/http/statusCodes.ts`
- `packages/backend/src/http/fastifyErrorHandler.ts`
- `packages/backend/src/http/handleRouteErrors.ts`

#### 2.1 Core concepts

- **`HTTPStatusCode`** union and constant object:
  - Typed set of allowed status codes.
  - Easy to read and prevents “magic numbers”.

- **`HTTPResponse<T>` discriminated union**:
  - Models common HTTP status codes with precise body shapes:
    - `200/201` → `body: T`
    - `204` → no body
    - `302` → `redirectUrl`
    - `304` → no body
    - `400/401/403/404/500` → `{ error: string }`
  - `isHTTPResponse` runtime type guard.

- **Helper factories** (`ok`, `created`, `noContent`, `redirect`, `notModified`, `badRequest`, `unauthorized`, `forbidden`, `notFound`, `internalServerError`):
  - Provide strongly-typed, schema-validated output via Zod.
  - Return `HTTPResponse` objects.

- **`HTTPException` hierarchy**:
  - Abstract base class with `statusCode` + `message`.
  - Concrete subclasses: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `InternalServerErrorException`, `RedirectException`.
  - Domain-specific `resource`-style messages for Forbidden/NotFound via `formatForbiddenMessage` / `formatNotFoundMessage`.
  - `isHTTPException` runtime type guard.

- **Validation helpers**:
  - `validateInput`, `validateOutput` leverage Zod and throw typed HTTP exceptions on failure.

- **`httpExceptionToResponse`**:
  - Converts an `HTTPException` into an `HTTPResponse`.
  - Special-cases `RedirectException`.

#### 2.2 Fastify integration

- **`fastifyErrorHandler.ts`**:
  - Wraps a route handler:
    - If the handler returns an `HTTPResponse`, automatically converts it via `sendHTTPResponse`.
    - If the handler throws an `HTTPException`, converts it via `httpExceptionToResponse` and sends it.
    - Non-HTTPException errors are re-thrown for Fastify’s own error handling.
  - This is a *manual wrapper* pattern per-route.

- **`handleRouteErrors.ts`** (older / alternate wrapper):
  - Similar idea but more manual: checks exception shape inline and calls `sendHTTPResponse`.
  - Also mixes in `errorToString` handling for 500s.

#### 2.3 Strengths

- Clear, well-typed **separation of concerns**:
  - Core error model (`HTTPException`, `HTTPResponse`) vs. Fastify integration.
- The **discriminated union** for responses makes testing and composability easy.
- Good **ergonomics** when writing business logic:
  - Throw `new NotFoundException('user', 'not in org')`.
  - Or `return ok(schema, data)`.

#### 2.4 Pain points for a reusable package

- Current approach requires **manual wrapping of handlers** with `fastifyErrorHandler`.
- The **core code is slightly coupled to Zod** (via `validateInput` / `validateOutput`).
- Some functions are **Fastify-specific** (`sendHTTPResponse`, wrapper signatures) and live in the same “mental space” as core HTTP abstractions.
- For new users, having to:
  - import a wrapper,
  - remember to wrap each route,
  - and sometimes manually call `sendHTTPResponse`
  is more friction than a simple “register this plugin” approach.

---

### 3. High-Level Design for the New Package

#### 3.1 Modules and entrypoints

- **Core module (`fastify-http-exceptions/core`)**
  - No Fastify imports.
  - Optionally depends on Zod for validation helpers (or those helpers could be in a separate `zod` entrypoint).
  - Exports:
    - `HTTPStatusCode` type and constant.
    - `HTTPResponse<T>` type and `isHTTPResponse`.
    - `HTTPException` base and subclasses.
    - `ExceptionResource` (possibly made generic or customizable).
    - Helpers:
      - `ok`, `created`, `noContent`, `redirect`, `notModified`.
      - `badRequest`, `unauthorized`, `forbidden`, `notFound`, `internalServerError`.
    - `httpExceptionToResponse`.
    - `isHTTPException`.
    - `validateInput`, `validateOutput` (either here or in `fastify-http-exceptions/zod`).

- **Fastify integration (`fastify-http-exceptions`)**
  - Depends on `fastify` as a peer dependency and the core module.
  - Exports:
    - `fastifyHttpExceptions` Fastify plugin.
    - Optional wrapper helper: `withHttpExceptions(handler)`.
    - Re-exports core types for convenience (`HTTPException`, etc.).

This split keeps the core logic reusable and testable anywhere, and keeps the Fastify coupling in one small adapter.

---

### 4. API Design – Core Module

#### 4.1 Types

- **`HTTPStatusCode`**
  - Keep the current union and constant (`HTTPStatusCode.OK`, `HTTPStatusCode.NOT_FOUND`, etc.).
  - Consider whether to add more status codes later; for now, keep it minimal and opinionated as in the existing code.

- **`HTTPResponse<T>`**
  - Preserve the current discriminated union structure.
  - Optionally:
    - Add `type` or `kind` fields for extensibility, but likely unnecessary.
  - Ensure `isHTTPResponse` checks all supported codes, including redirects and non-modified.

#### 4.2 Exception hierarchy

- **`HTTPException` base class**:
  - Same as current design: `statusCode`, `message`, and `name`.
  - Ensure it is framework-agnostic: no Fastify types used here.
  - Add a **branded property** for easier and more robust detection:
    - `readonly isHTTPException = true as const;`

- **Concrete exceptions**:
  - `BadRequestException`
  - `UnauthorizedException`
  - `ForbiddenException`
  - `NotFoundException`
  - `InternalServerErrorException`
  - `RedirectException`

Keep their constructors and semantics very close to the existing implementation to minimize migration complexity.

#### 4.3 Helper factories

**Decision: keep the helpers (`ok`, `noContent`, etc.) in the core module.**

Reasons:
- They are **pure**: they just build `HTTPResponse` values.
- They are not Fastify-specific and are useful even in tests or other frameworks.
- They make the main experience more ergonomic, which is the priority for adoption.

`validateInput` / `validateOutput`:
- Keep them, because they are very ergonomic, but:
  - Make Zod a **peer dependency** for the core entrypoint, or
  - Alternatively, move them into a `fastify-http-exceptions/zod` sub-entrypoint so non-Zod users are not forced to install it.

For simplicity in the first iteration, it’s reasonable to keep the current Zod-based helpers in the core, with Zod as a peer dependency, and document this clearly.

#### 4.4 Converting exceptions to responses

`httpExceptionToResponse(exception: HTTPException): HTTPResponse`:
- Use the current implementation almost verbatim.
- It is the primary bridge from “throwing exceptions” to “structured HTTP responses”.

`isHTTPException(error: unknown): error is HTTPException`:
- Keep the runtime guard; it is used in integration layers (Fastify plugin, tests, and possibly user code).
- Implement it using:
  - A fast path: `error instanceof HTTPException`.
  - A branded fallback: an object check where `(error as { isHTTPException?: unknown }).isHTTPException === true`.
  - This avoids heavier structural checks on `statusCode` and `message` while remaining resilient to cross-realm / multiple-copy scenarios.

---

### 5. API Design – Fastify Integration

The goal is to have **one simple thing** a user does in their Fastify app:

```ts
import Fastify from 'fastify';
import fastifyHttpExceptions from 'fastify-http-exceptions';

const app = Fastify();

app.register(fastifyHttpExceptions, {
  logUnhandled: true, // optional
});
```

After this:
- In route handlers, users can:
  - **Throw exceptions**:
    - `throw new NotFoundException('user', 'not found');`
  - **Or return `HTTPResponse` values**:
    - `return ok(UserSchema, user);`
  - Both will automatically be translated into Fastify replies.

#### 5.1 Plugin behavior

`fastifyHttpExceptions(fastify, options, done)`:

- **Error handler**:
  - Install a Fastify-level `setErrorHandler` if one is not already set, or wrap the existing one.
  - In the handler:
    - If `error` is an `HTTPException` (using `isHTTPException`):
      - Convert to `HTTPResponse` via `httpExceptionToResponse`.
      - Map `HTTPResponse` to a real reply:
        - `reply.status(response.statusCode)` and send the body or handle redirect.
      - Optionally log at a configurable level (e.g., `warn` for 4xx, `error` for 5xx).
    - If not an `HTTPException`:
      - Delegate to existing error handler (or default Fastify behavior).

- **Hook or decorator for returned `HTTPResponse` values**:
  - Use an `onSend` or `preHandler` / `onRoute` pattern to detect if a handler returned an `HTTPResponse`:
    - Easiest approach:
      - Encourage users to either:
        - Throw exceptions, or
        - Call `reply.sendHTTP(response)` using a decorator.
      - But the current code already supports directly returning an `HTTPResponse` without explicit `reply.send`.
  - To keep behavior close to what you have now:
    - Add a **decorator** on `reply`:
      - `reply.sendHTTP(response: HTTPResponse)`.
      - This just calls the internal `sendHTTPResponse` equivalent.
    - And add a **wrapper helper**:
      - `withHttpExceptions(handler)` that:
        - Accepts a `(request, reply) => Promise<HTTPResponse | any>`.
        - If the handler returns an `HTTPResponse`, calls `reply.sendHTTP` automatically.
        - If it throws an `HTTPException`, converts via `httpExceptionToResponse` and calls `reply.sendHTTP`.
      - This preserves the ergonomic pattern you already use while giving users a simple plugin-based default.

To keep the plugin minimal and unsurprising:
- **Primary happy path** (documented first):
  - Throw `HTTPException` from handlers.
  - Let the plugin’s error handler take care of translating to responses.
- **Optional advanced pattern**:
  - Use `withHttpExceptions(handler)` if you prefer returning `HTTPResponse` values instead of relying on Fastify’s error pipeline.

#### 5.2 Mapping `HTTPResponse` to Fastify replies

The plugin will internally contain logic similar to your existing `sendHTTPResponse` helper:

- For `200/201`:
  - `reply.code(statusCode).send(body)`.
- For `204`:
  - `reply.code(204).send();`
- For `302`:
  - `reply.redirect(302, redirectUrl);`
- For `304`:
  - `reply.code(304).send();`
- For `400/401/403/404/500`:
  - `reply.code(statusCode).send(body);`

This helper should live in the Fastify integration module and not in the core module.

---

### 6. Usage Examples (from a Fastify user’s perspective)

#### 6.1 Basic setup

```ts
import Fastify from 'fastify';
import fastifyHttpExceptions, {
  HTTPException,
  NotFoundException,
  ok,
} from 'fastify-http-exceptions';

const app = Fastify();

app.register(fastifyHttpExceptions);
```

#### 6.2 Throwing exceptions

```ts
app.get('/users/:id', async (request, reply) => {
  const user = await findUser(request.params.id);
  if (!user) {
    throw new NotFoundException('user');
  }
  return ok(UserSchema, user); // or just reply.send(user) if they prefer
});
```

- If `NotFoundException` is thrown:
  - Plugin turns it into a `404` with `{ error: "user not found" }`.
- If `ok` is returned:
  - If using `withHttpExceptions`, it auto-sends.
  - If using plugin-only mode, the user can either:
    - `reply.sendHTTP(ok(UserSchema, user));`, or
    - Use a route wrapper (`withHttpExceptions`) as an opt-in pattern.

#### 6.3 Optional wrapper helper

```ts
import { withHttpExceptions, ok, NotFoundException } from 'fastify-http-exceptions';

app.get(
  '/users/:id',
  withHttpExceptions(async (request, reply) => {
    const user = await findUser(request.params.id);
    if (!user) throw new NotFoundException('user');
    return ok(UserSchema, user);
  }),
);
```

This pattern is almost identical to your current `fastifyErrorHandler` usage and is convenient for users who like to return `HTTPResponse` objects directly.

---

### 7. Implementation Plan

#### 7.1 Package creation

- **Repository layout (within this monorepo or standalone)**:

  - `packages/fastify-http-exceptions/`
    - `src/core/`
      - `statusCodes.ts`
      - `httpResponse.ts` (HTTPResponse type + helpers + isHTTPResponse)
      - `httpException.ts` (base class + subclasses + isHTTPException + httpExceptionToResponse)
      - `validation.ts` (validateInput/validateOutput using Zod)
    - `src/fastify/`
      - `plugin.ts` (Fastify plugin)
      - `withHttpExceptions.ts` (optional wrapper helper)
      - `sendHTTPResponse.ts` (Fastify-specific response mapper)
    - `src/index.ts` (Fastify entrypoint, re-export core)
    - `src/core.ts` (core-only entrypoint)
    - `package.json` (with peer dependencies for `fastify` and `zod`)
    - `README.md` (usage, examples, migration notes)
    - `tsconfig.json`
    - `vitest`/`jest` config and tests.

#### 7.2 Code extraction and refactor

1. **Move core types and logic**:
   - Extract `HTTPStatusCode` and `HTTPStatusCode` constant from current `statusCodes.ts` into `src/core/statusCodes.ts`.
   - Extract `HTTPResponse`, `isHTTPResponse`, helpers (`ok`, `created`, etc.), `HTTPException` hierarchy, `httpExceptionToResponse`, `isHTTPException`, `validateInput`, `validateOutput` from `httpException.ts` into new core files.
   - Adjust imports to use relative paths inside the new package.

2. **Create Fastify adapter**:
   - Implement `sendHTTPResponse(reply, response)` in `src/fastify/sendHTTPResponse.ts` (using your existing `fastifyResponse` logic as reference).
   - Implement `withHttpExceptions` in `src/fastify/withHttpExceptions.ts` using the logic in `fastifyErrorHandler.ts`:
     - Wrap the handler.
     - If it returns `HTTPResponse`, call `sendHTTPResponse`.
     - If it throws `HTTPException`, use `httpExceptionToResponse` + `sendHTTPResponse`.
     - Re-throw non-HTTP exceptions.
   - Implement `fastifyHttpExceptions` plugin in `src/fastify/plugin.ts`:
     - Registers an error handler that detects `HTTPException` and converts it.
     - Optionally decorates `reply` with `sendHTTP`.

3. **Public API definition**:
   - `src/index.ts`:
     - Export `fastifyHttpExceptions`, `withHttpExceptions`, `sendHTTPResponse` (optional).
     - Re-export core entities (`HTTPException`, `HTTPResponse`, helpers, etc.) so users can import from the main entrypoint.
   - `src/core.ts`:
     - Re-export only the core entities (no Fastify types) for non-Fastify usage.

4. **TypeScript declarations**:
   - Ensure `types` / `exports` fields in `package.json` expose:
     - `"."`: main Fastify plugin entrypoint.
     - `"./core"`: core-only entrypoint.

#### 7.3 Tests

- **Core tests**:
  - `HTTPException` subclasses have correct `statusCode` and messages.
  - `httpExceptionToResponse` returns expected `HTTPResponse`.
  - `isHTTPException` / `isHTTPResponse` behave correctly.
  - `validateInput` / `validateOutput` integrate with Zod correctly.

- **Fastify integration tests**:
  - Register plugin and:
    - Route that throws `NotFoundException` → 404 with expected body.
    - Route that throws `RedirectException` → 302 redirect.
    - Route that throws unknown Error → delegated to Fastify’s default handler.
  - With `withHttpExceptions`:
    - Route returns `ok(...)` → 200 with validated body.
    - Route throws `BadRequestException` → 400 with `{ error: message }`.

#### 7.4 Documentation & examples

- Write a `README.md` including:
  - Install instructions (`fastify`, `zod` as peers).
  - “Quick start” example (plugin + throwing exceptions).
  - Optional advanced section (returning `HTTPResponse`, `withHttpExceptions` usage).
  - Migration notes from current internal code:
    - The mapping from existing helpers to exported helpers is 1:1.
    - `fastifyErrorHandler` → `withHttpExceptions` or plugin-only mode.

---

### 8. Design Decisions Summary

- **Keep helper functions** (`ok`, `noContent`, etc.) in the **core module**:
  - They are pure and framework-agnostic.
  - They significantly improve ergonomics and understanding for new users.

- **Do not require manual wrapping** of all handlers for basic usage:
  - Primary recommended integration is via a **Fastify plugin** (`fastifyHttpExceptions`) that:
    - Handles thrown `HTTPException` instances automatically.
  - Provide **`withHttpExceptions`** as an optional, ergonomic helper for those who like returning `HTTPResponse` directly.

- **Keep the module pure at its core**:
  - Core does not depend on Fastify.
  - Fastify-specific behavior lives in a small adapter layer (plugin + helper).

- **Optimize for Fastify user experience**:
  - One-time `app.register(fastifyHttpExceptions)` is enough to start throwing HTTP exceptions.
  - Clear, typed helpers make route logic simple and easy to reason about.

This plan provides a clean, reusable HTTP exception model with a first-class Fastify integration that is easy to adopt and understand for new users, while closely aligning with (and reusing) your existing, battle-tested design.


