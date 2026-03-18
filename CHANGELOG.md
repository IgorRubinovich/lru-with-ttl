# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-03-16

### Added
- Isomorphic support: Replaced Node.js `events` with `ee-ts` for browser compatibility.
- Dual-module support: The package now provides both ESM (`.mjs`) and CommonJS (`.js`) distributions.
- Type-safe events: Added `LruEvents` interface for better TypeScript integration.
- `exports` field in `package.json` for modern resolution.

### Changed
- Converted source code to standard ESM `import`/`export` syntax.
- Updated build system to use `esbuild` for faster and cleaner bundles.
- Improved `LinkedQueue` internal structure for better performance.

### Fixed
- Fixed issues with Vite/Rolldown pre-bundling by providing native ESM entry points.
- Resolved build warnings regarding `exports` order in `package.json`.
