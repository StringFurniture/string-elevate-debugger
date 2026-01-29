# String Elevate Debugger

Vue 3 + Vite app for exploring Elevate search/landing responses, products, facets, and raw payloads.

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- pnpm (the repo pins `pnpm@10.20.0`)

## Quick start

1) Install dependencies

```sh
pnpm install
```

2) Set required environment variables

Create a `.env.local` file at the repo root:

```sh
VITE_ELEVATE_CLUSTER_ID=your-cluster-id
# Optional: override the generated customer key
VITE_ELEVATE_CUSTOMER_KEY=your-customer-key
```

3) Run the dev server

```sh
pnpm dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## Environment variables

- `VITE_ELEVATE_CLUSTER_ID` (required): Elevate cluster ID used by the API client.
- `VITE_ELEVATE_CUSTOMER_KEY` (optional): Customer key override. If not set, a key is generated and persisted in localStorage.

## Common commands

```sh
pnpm dev
pnpm build
pnpm preview
pnpm type-check
pnpm lint
```

## Recommended IDE setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur).

## Recommended browser setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type support for `.vue` imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we use `vue-tsc` for type checking. In editors, Volar makes the TypeScript language service aware of `.vue` types.
