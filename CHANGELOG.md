# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-08-03

### Added
- Full TypeScript rewrite with strict types and exported interfaces
- `generate()` with typed overloads for `users`, `products`, `orders`
- `generateAsync()` — Promise-based wrapper
- `generateStream()` — memory-efficient generator function (1k-record batches)
- `registerGenerator()` / `unregisterGenerator()` / `listGenerators()` plugin API
- `Random` class — Mulberry32 seeded PRNG with `uuid`, `date`, `phone`, `weightedPick`, `shuffle`, `sample`
- `SeedManager` — deterministic per-type child seeds via namespace hashing
- Built-in data: 200+ first/last names, 60 US cities, 10 product categories with subcategories
- Weighted distributions for order status, payment methods, user roles
- CLI (`mock-generate`) supporting `--count`, `--seed`, `--output`, `--pretty`, `--list`
- Jest test suite (~290 tests) with ≥ 90% coverage
- GitHub Actions CI workflow (Node 18, 20, lint, test, coverage upload)
- Zero runtime dependencies
