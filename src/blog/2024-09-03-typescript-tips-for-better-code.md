---
title: 5 TypeScript Tips for Better Code Quality
date: 2024-09-03
description: Practical TypeScript patterns that will make your code more maintainable and type-safe.
draft: false
tags:
  - post
  - typescript
  - programming
---

After yearsof writing TypeScript, I've collected a set of patterns that consistently improve code quality. Here are my top 5.

## 1. Use `unknown` Instead of `any`

When you don't know the type of something, reach for `unknown` rather than `any`. Unlike `any`, `unknown` forces you to narrow the type before using it.

```typescript
// Bad
function processData(data: any) {
  return data.value; // No type checking!
}

// Good
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return data.value; // Type-safe
  }
}
```

## 2. Leverage Discriminated Unions

Discriminated unions make pattern matching on types explicit and exhaustive.

```typescript
type Result<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function handleResult<T>(result: Result<T>) {
  switch (result.status) {
    case 'success': return result.data;
    case 'error': throw new Error(result.message);
  }
}
```

## 3. Use `satisfies` for Type Validation Without Widening

The `satisfies` operator lets you validate a value against a type without losing its specific type information.

```typescript
const config = {
  port: 3000,
  host: 'localhost',
} satisfies Record<string, string | number>;

// config.port is still typed as 3000, not number
```

## 4. Prefer Template Literal Types

Template literal types are great for creating constrained string types.

```typescript
type EventName = `on${Capitalize<string>}`;
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiRoute = `/api/${string}`;
```

## 5. Use `const` Assertions

`as const` turns mutable objects into readonly tuples and narrows their types to literals.

```typescript
const DIRECTIONS = ['north', 'south', 'east', 'west'] as const;
type Direction = typeof DIRECTIONS[number]; // 'north' | 'south' | 'east' | 'west'
```

These patterns have saved me countless hours of debugging. Try incorporating them into your next TypeScript project!
