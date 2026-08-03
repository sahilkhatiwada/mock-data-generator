# Contributing to mock-data-generator

## Branch workflow

Every change — no matter how small — goes through a feature branch and a PR.
**Direct pushes to `main`/`master` are not allowed.**

```
main/master  ←──── PR merge (squash or merge commit)
    │
    └── feature/add-employee-generator
    └── fix/prng-overflow-node24
    └── chore/bump-eslint
    └── docs/update-api-reference
```

### Branch naming

| Prefix | When to use |
|--------|-------------|
| `feat/` | New feature or generator type |
| `fix/` | Bug fix |
| `chore/` | Dependency bumps, tooling |
| `docs/` | Documentation only |
| `test/` | Tests only |
| `ci/` | CI/CD changes |
| `refactor/` | Code restructuring |
| `perf/` | Performance improvements |

---

## Step-by-step: making a change

```bash
# 1. Start from an up-to-date master
git checkout master
git pull origin master

# 2. Create a feature branch
git checkout -b feat/my-new-feature

# 3. Make your changes in src/, tests/, docs/ etc.

# 4. Run checks locally before pushing
npm run lint          # ESLint + TypeScript type-check
npm test              # Jest with coverage
npm run build         # Verify TypeScript compiles

# 5. Commit using Conventional Commits format
git add <files>
git commit -m "feat: add employee generator type"

# 6. Push the branch
git push -u origin feat/my-new-feature

# 7. Open a Pull Request on GitHub targeting main/master
#    PR title must follow Conventional Commits (CI enforces this)
```

---

## Releasing a new version

Releases happen **only from `main`/`master`** after a PR is merged.

```bash
# 1. Make sure you are on master and it is up to date
git checkout master
git pull origin master

# 2. Bump the version (choose one):
npm version patch     # 1.0.0 → 1.0.1  (bug fixes)
npm version minor     # 1.0.0 → 1.1.0  (new features, backwards-compatible)
npm version major     # 1.0.0 → 2.0.0  (breaking changes)

# npm version will:
#   - Update package.json version
#   - Create a git commit  "1.0.1"
#   - Create a git tag     "v1.0.1"

# 3. Push the commit AND the tag
git push origin master --tags
```

This triggers the **Release & Publish** workflow (`.github/workflows/release.yml`) which:
1. Re-runs lint + tests + build as a final gate
2. Publishes the package to npm (`npm publish`)
3. Creates a GitHub Release with changelog notes

---

## npm login (first-time setup)

You need an `NPM_TOKEN` secret in your GitHub repository settings.

1. Log in to [npmjs.com](https://www.npmjs.com) and go to **Access Tokens**
2. Create a new **Automation** token (type: `Automation`)
3. In your GitHub repo → **Settings → Secrets and variables → Actions**
4. Add a secret named `NPM_TOKEN` with the token value

To verify locally:
```bash
npm login          # interactive login
npm whoami         # should print your npm username
```

---

## PR title format

PR titles must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>
```

| Type | Example |
|------|---------|
| `feat` | `feat: add streaming CSV output` |
| `fix` | `fix: correct UUID variant bits` |
| `chore` | `chore: upgrade typescript to 5.9` |
| `docs` | `docs: add custom generator guide` |
| `test` | `test: add edge cases for weightedPick` |
| `ci` | `ci: add Node 22 to test matrix` |
| `refactor` | `refactor: extract address builder helper` |
| `perf` | `perf: cache CITIES array lookup` |

---

## Commit message format

Individual commits follow the same Conventional Commits format.

```bash
git commit -m "feat: add employee generator type"
git commit -m "fix: prevent negative zip codes"
git commit -m "test: add seed consistency tests for orders"
```

---

## Code standards

- All source in `src/` is **strict TypeScript** — no `any` unless unavoidable
- Every new public function needs a **JSDoc comment**
- Every new feature needs **tests** in `tests/`
- Coverage must stay **≥ 90%** across all metrics
- Run `npm run format` before committing to apply Prettier
