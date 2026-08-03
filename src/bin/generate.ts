#!/usr/bin/env node
/**
 * CLI entry-point for mock-data-generator.
 * Delegates all logic to src/cli.ts for testability.
 */

import { run } from '../cli';

process.exitCode = run(process.argv.slice(2));
