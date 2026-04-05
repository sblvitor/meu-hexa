# TanStack Start + shadcn/ui

This is a template for a new TanStack Start project with React, TypeScript, and shadcn/ui.

This repo uses [Bun](https://bun.sh) (`bun.lock`). Install deps with `bun install`; run scripts with `bun run <script>`.

## Adding components

To add components to your app, run:

```bash
bunx --bun shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
