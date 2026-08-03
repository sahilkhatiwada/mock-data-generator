/**
 * CLI implementation for mock-data-generator.
 * All logic lives here so bin/generate.ts can stay a thin wrapper (and be testable).
 *
 * Usage:
 *   mock-generate <types...> [options]
 *
 * Options:
 *   --count=<n>       Records per type  (default: 10)
 *   --seed=<n>        Reproducibility seed
 *   --output=<file>   Write output to a file instead of stdout
 *   --pretty          Pretty-print JSON (2-space indent)
 *   --list            List available generator types
 *   --version         Print version
 *   --help            Print help
 */

import * as fs from 'fs';
import * as path from 'path';
import { generate, listGenerators } from './index';
import type { TypeOptionsMap } from './types';

// ─── Internal types ───────────────────────────────────────────────────────────

interface ParsedArgs {
  types: string[];
  flags: Record<string, string | true>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getVersion(): string {
  try {
    const pkgPath = path.resolve(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function printHelp(): void {
  const v = getVersion();
  process.stdout.write(`
mock-data-generator v${v}
Generate realistic mock data without external dependencies.

USAGE
  mock-generate <types...> [options]

TYPES
  users       Generate user records
  products    Generate product records
  orders      Generate order records

OPTIONS
  --count=<n>       Records to generate per type  (default: 10)
  --seed=<n>        Seed for reproducibility
  --output=<file>   Write output to a file instead of stdout
  --pretty          Pretty-print JSON (2-space indent)
  --list            List all registered generator types
  --version         Print current version
  --help            Show this help message

EXAMPLES
  mock-generate users --count=50
  mock-generate users products orders --count=25
  mock-generate users --count=100 --seed=12345
  mock-generate users products --count=50 --pretty --output=data.json
  mock-generate --list
`);
}

/**
 * Parses raw argv tokens into typed structures.
 * Supports `--flag` (boolean) and `--key=value` syntax.
 */
export function parseArgs(argv: string[]): ParsedArgs {
  const types: string[] = [];
  const flags: Record<string, string | true> = {};

  for (const arg of argv) {
    if (arg.startsWith('--')) {
      const withoutDashes = arg.slice(2);
      const eqIdx = withoutDashes.indexOf('=');
      if (eqIdx !== -1) {
        flags[withoutDashes.slice(0, eqIdx)] = withoutDashes.slice(eqIdx + 1);
      } else {
        flags[withoutDashes] = true;
      }
    } else if (!arg.startsWith('-')) {
      types.push(arg.toLowerCase());
    }
  }

  return { types, flags };
}

/** Serialises data as compact or pretty JSON. */
export function serialise(data: unknown, pretty: boolean): string {
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

/** Writes content to stdout or a file. */
function writeOutput(content: string, outputPath: string | undefined): void {
  if (outputPath) {
    const resolved = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(resolved, content, 'utf8');
    process.stderr.write(`✓ Written to ${resolved}\n`);
  } else {
    process.stdout.write(content + '\n');
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * CLI entry-point. Accepts argv for testability.
 * @returns exit code (0 = success, 1 = error)
 */
export function run(argv: string[] = process.argv.slice(2)): number {
  const { types, flags } = parseArgs(argv);

  // ── Informational flags ──────────────────────────────────────────────────
  if (flags['help'] || flags['h']) {
    printHelp();
    return 0;
  }
  if (flags['version'] || flags['v']) {
    process.stdout.write(`mock-data-generator v${getVersion()}\n`);
    return 0;
  }
  if (flags['list']) {
    process.stdout.write('Available generator types:\n');
    listGenerators().forEach((t) => process.stdout.write(`  - ${t}\n`));
    return 0;
  }

  // ── Require at least one type ────────────────────────────────────────────
  if (types.length === 0) {
    process.stderr.write('Error: No generator type specified.\n');
    process.stderr.write('Run `mock-generate --help` for usage.\n');
    return 1;
  }

  // ── Parse --count ────────────────────────────────────────────────────────
  let count = 10;
  if (flags['count'] !== undefined && flags['count'] !== true) {
    count = parseInt(flags['count'] as string, 10);
    if (!Number.isInteger(count) || count < 0) {
      process.stderr.write(`Error: --count must be a non-negative integer, got: "${flags['count']}"\n`);
      return 1;
    }
  }

  // ── Parse --seed ─────────────────────────────────────────────────────────
  let seed: number | undefined;
  if (flags['seed'] !== undefined && flags['seed'] !== true) {
    seed = parseInt(flags['seed'] as string, 10);
    if (!Number.isFinite(seed) || seed < 0) {
      process.stderr.write(`Error: --seed must be a non-negative integer, got: "${flags['seed']}"\n`);
      return 1;
    }
  }

  const pretty = flags['pretty'] === true;
  const outputFile =
    flags['output'] !== undefined && flags['output'] !== true
      ? (flags['output'] as string)
      : undefined;

  // ── Generate ─────────────────────────────────────────────────────────────
  try {
    let result: unknown;

    if (types.length === 1) {
      result = generate(types[0], { count, ...(seed !== undefined ? { seed } : {}) });
    } else {
      const typeMap: TypeOptionsMap = {};
      for (const t of types) {
        typeMap[t] = { count, ...(seed !== undefined ? { seed } : {}) };
      }
      result = generate(typeMap);
    }

    writeOutput(serialise(result, pretty), outputFile);
    return 0;
  } catch (err) {
    process.stderr.write(`Error: ${(err as Error).message}\n`);
    return 1;
  }
}
