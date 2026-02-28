# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2026-02-28

### Added
- **Testing Infrastructure**: Comprehensive testing strategy implemented.
  - Added `vitest` for Unit and Integration testing.
  - Added `playwright` for End-to-End (E2E) testing.
  - Added `msw` for mocking API responses.
  - Added `@axe-core/playwright` for automated accessibility testing.
- **Integration Tests**: Verified Mercado Libre token refresh flow and error handling (`src/lib/mercadolibre.integration.test.ts`).
- **E2E Tests**: Added tests for Login redirect and Homepage load (`tests/auth.spec.ts`, `tests/api.spec.ts`).
- **Performance**: Added `scripts/performance-test.ts` to measure API latency.
- **Security**: Added encryption for token storage using AES-256-GCM.
- **CI/CD**: Added GitHub Actions workflows for PR checks (`.github/workflows/test.yml`) and nightly regression (`.github/workflows/regression.yml`).

### Changed
- **Refactor**: Refactored `src/lib/mercadolibre.ts` to `MeliClient` class using Dependency Injection.
- **Refactor**: Updated `TokenStorage`, `RateLimiter`, and `Logger` to implement interfaces (`ITokenStorage`, `IRateLimiter`, `ILogger`).
- **Security**: `TokenStorage` now encrypts tokens at rest.
- **Accessibility**: Added `aria-label` to social links in Footer and icon buttons in Navbar.

### Fixed
- Fixed missing `encodeURIComponent` in `getAuthURL` method of `MeliClient`.
- Addressed accessibility violations (missing labels on buttons and links).
