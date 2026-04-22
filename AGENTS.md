## Commands

```bash
# Install dependencies
npm install

# Lint TypeScript source
npm run lint

# Run all tests
npm test

# Run tests with coverage
npm run test-with-coverage

# Run a single test file
npx jest test/visearch.test.js

# Build browser bundle (production, uploads to S3)
npm run build

# Build browser bundle (development, no S3 upload)
npm run build-dev

# Build ESM package output
npm run build-esm

# Build CJS package output
npm run build-cjs

# Build both CJS+ESM and run fixup (used before npm publish)
npm run prepack
```

Tests that hit the live API require a `.env` file with `SEARCH_APP_KEY`, `SEARCH_PLACEMENT_ID`, `REC_APP_KEY`, `REC_PLACEMENT_ID`, `ENDPOINT`, `SEARCH_IM_URL`, and `REC_PID`.

## Architecture

This is a JavaScript/TypeScript SDK for the ViSearch / Rezolve product search API, distributed in three forms:
- **ESM** (`esm/`) — tree-shakeable module build via `tsconfig.json`
- **CJS** (`cjs/`) — CommonJS build via `tsconfig.cjs.json`
- **Browser bundle** (`dist/`) — single-file UMD bundle produced by Webpack from `index.ts`

### Source layout

| File | Role |
|------|------|
| `index.ts` | Browser entry point. Registers `viInit` on the global `window`/`self` context and replays any queued stub calls. |
| `src/visearch.ts` | Core factory function `ViSearch(configs)`. Returns a `ViSearchClient` instance. Owns tracker lifecycle, event sending, query-ID persistence, and A/B experiment wrapping. |
| `src/productsearch.ts` | All API search functions (`multisearch`, `searchByImage`, `searchById`, etc.). Each function assembles query params and delegates to `sendPostRequest` or `sendGetRequest`. |
| `src/common.ts` | Low-level HTTP helpers (`sendGetRequest`, `sendPostRequest`). Handles FormData construction, image resizing before upload, timeout racing, and response parsing. |
| `src/resizer.ts` | Canvas-based image resize logic (default 512×512 max). Used by `sendPostRequest` automatically unless `disable_resize` is set. |
| `types/shared.d.ts` | All public TypeScript types: `ViSearchClient`, `ViSearchSettings`, `ProductSearchResponse`, etc. |

### Key data flows

**Search by image upload**: `ViSearch.productSearchByImage` → `productsearch.searchByImage` → `common.sendPostRequest` → `resizer.resizeImage` (auto-resize unless `disable_resize`) → `fetch` with FormData.

**Search by ID (GET)**: `ViSearch.productSearchById` → `productsearch.searchById` → `common.sendGetRequest` → `fetch` with URL query params.

**Tracking**: A `visenze-tracking-javascript` (`VAClient`) instance is lazily created on first use. Analytics params (`va_uid`, `va_sdk`, `va_sid`, `va_sdk_version`) are injected into every search request via `getAnalyticsParams`. Successful responses persist `reqid` to `localStorage` under the key `visenze_query_id_<placement_id>`.

**Endpoint resolution** (`productsearch.ts`): defaults to `https://multimodal.search.rezolve.com`; overridden by `settings.endpoint` or `settings.is_cn` (points to `https://search.visenze.com.cn`).

**Stub/async loading pattern** (`index.ts`): The SDK supports async script loading. Before the bundle loads, callers push commands onto `window.<clientName>.q`. After load, `viInit` replays those queued commands against the real client via `applyPrototypesCall`.

### Build notes

- `npm run write-version` generates `src/version.ts` from `package.json` — this file is not committed and must exist before any build or test run.
- The `fixup` shell script post-processes CJS output (run automatically by `prepack`).
- Production Webpack build uploads the minified bundle to S3 (`visenze-static` bucket, `visearch/dist/js/`). Requires `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` env vars.
