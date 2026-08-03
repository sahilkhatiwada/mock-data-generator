/**
 * Runs automatically via `npm version` hook.
 * Replaces the [Unreleased] heading in CHANGELOG.md with the new version + today's date.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const version = pkg.version;
const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const changelogPath = path.resolve(__dirname, '../CHANGELOG.md');
let content = fs.readFileSync(changelogPath, 'utf8');

// If there's an [Unreleased] section, rename it to the new version
if (content.includes('## [Unreleased]')) {
  content = content.replace(
    '## [Unreleased]',
    `## [${version}] — ${date}`
  );
  // Prepend a fresh [Unreleased] section for the next cycle
  const unreleasedTemplate = `## [Unreleased]\n\n### Added\n\n### Fixed\n\n### Changed\n\n---\n\n`;
  content = content.replace(
    '# Changelog\n',
    `# Changelog\n\n${unreleasedTemplate}`
  );
} else {
  // No [Unreleased] found — just prepend the new entry
  content = content.replace(
    /^(# Changelog\n)/,
    `$1\n## [${version}] — ${date}\n\n`
  );
}

fs.writeFileSync(changelogPath, content, 'utf8');
console.log(`CHANGELOG.md updated for v${version}`);
