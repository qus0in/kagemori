import path from 'node:path';
import { scanDirectories, summarizeInspection } from './line-limits-core.ts';

function runCli(): void {
  const args = process.argv.slice(2);
  const isStrict = args.includes('--strict');
  const showSuggest = args.includes('--suggest') || args.includes('--fix');
  const isJson = args.includes('--json');

  const rootDir = process.cwd();
  const results = scanDirectories(rootDir);
  const summary = summarizeInspection(results, isStrict);

  if (isJson) {
    console.log(JSON.stringify(summary, null, 2));
    process.exit(summary.hasErrors ? 1 : 0);
  }

  console.log('=== Line Limit Inspector (ADR 0004: 128 / 1000 lines) ===');
  console.log(`Scanned files: ${summary.scannedFiles}`);
  if (summary.maxLineFile) {
    console.log(`Longest file: ${summary.maxLineFile.filePath} (${summary.maxLineFile.lineCount} lines)`);
  }

  if (summary.hardViolations.length > 0) {
    console.error(`\n❌ [Hard Limit Error] ${summary.hardViolations.length} file(s) exceeded 1000 lines:`);
    for (const v of summary.hardViolations) {
      console.error(`  - ${v.filePath}: ${v.lineCount} lines (limit: 1000)`);
      if (showSuggest) {
        v.suggestions.forEach((s) => console.error(`    ↳ Suggestion: ${s}`));
      }
    }
  }

  if (summary.softViolations.length > 0) {
    const prefix = isStrict ? '❌ [Strict Error]' : '⚠️  [Warning]';
    console.warn(`\n${prefix} ${summary.softViolations.length} source file(s) exceeded 128 lines:`);
    for (const v of summary.softViolations) {
      console.warn(`  - ${v.filePath}: ${v.lineCount} lines (limit: 128)`);
      if (showSuggest) {
        v.suggestions.forEach((s) => console.warn(`    ↳ Suggestion: ${s}`));
      }
    }
  }

  if (!summary.hasErrors && summary.softViolations.length === 0) {
    console.log('\n✅ All inspected files are within 128 (src) and 1000 (repo) line limits.');
  } else if (!summary.hasErrors) {
    console.log('\n✅ Passed hard limits. No files exceed 1000 lines.');
  }

  if (summary.hasErrors) {
    console.error('\nLine limit check failed. Please refactor bloated files into smaller modules.');
    process.exit(1);
  }
}

runCli();
