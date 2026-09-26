import fs from 'node:fs';
import path from 'node:path';

export interface LineLimitConfig {
  softLimit?: number; // default: 128
  hardLimit?: number; // default: 1000
  targetDirs?: string[]; // default: ['src', 'test', 'docs', '.agents']
  ignoreDirs?: string[];
}

export interface FileLineResult {
  filePath: string;
  lineCount: number;
  isHardViolation: boolean; // > hardLimit
  isSoftViolation: boolean; // > softLimit (for src files or general depending on rules)
  suggestions: string[];
}

export interface InspectionSummary {
  scannedFiles: number;
  hardViolations: FileLineResult[];
  softViolations: FileLineResult[];
  maxLineFile: FileLineResult | null;
  hasErrors: boolean;
}

const DEFAULT_CONFIG: Required<LineLimitConfig> = {
  softLimit: 128,
  hardLimit: 1000,
  targetDirs: ['src', 'test', 'docs', '.agents'],
  ignoreDirs: ['node_modules', 'dist', '.git', '.wrangler', '.gemini', '.system_generated', 'coverage'],
};

export function getRefactoringSuggestions(filePath: string, lineCount: number): string[] {
  const suggestions: string[] = [];
  const normalized = filePath.replace(/\\/g, '/');

  if (normalized.includes('/ui/components/') || normalized.endsWith('.tsx')) {
    suggestions.push('Split UI components into smaller presentational subcomponents');
    suggestions.push('Extract custom hooks for complex state/handlers (e.g. use*Action.ts)');
    suggestions.push('Move shared styles, labels, or dictionary data to constant files');
  } else if (normalized.includes('/app/usecases/')) {
    suggestions.push('Extract orchestration helper methods into a dedicated Helper or Validator module');
    suggestions.push('Separate request/response mapping into app/dto/');
  } else if (normalized.includes('/domain/')) {
    suggestions.push('Split value objects, entities, and type definitions into separate files');
    suggestions.push('Move validation logic into *Validation.ts');
  } else if (normalized.includes('/infra/')) {
    suggestions.push('Extract large seed data arrays into chunked files (e.g. Seed*Part1.ts)');
    suggestions.push('Extract query builder or response adapter into helper modules');
  } else if (normalized.startsWith('test/')) {
    suggestions.push('Split extensive test scenarios into multiple BDD feature files');
    suggestions.push('Extract shared mock setup or test fixtures into helper utilities');
  } else {
    suggestions.push('Decompose large module into single-responsibility submodules');
  }

  return suggestions;
}

export function inspectFileContent(filePath: string, content: string, config?: LineLimitConfig): FileLineResult {
  const softLimit = config?.softLimit ?? DEFAULT_CONFIG.softLimit;
  const hardLimit = config?.hardLimit ?? DEFAULT_CONFIG.hardLimit;

  const lines = content.split('\n');
  const lineCount = lines.length;
  const normalized = filePath.replace(/\\/g, '/');

  const isHardViolation = lineCount > hardLimit;
  // Soft violation applies strictly to src code, but can be flagged for other files
  const isSoftViolation = normalized.startsWith('src/') && lineCount > softLimit;

  const suggestions = (isHardViolation || isSoftViolation)
    ? getRefactoringSuggestions(filePath, lineCount)
    : [];

  return {
    filePath,
    lineCount,
    isHardViolation,
    isSoftViolation,
    suggestions,
  };
}

export function scanDirectories(rootDir: string, config?: LineLimitConfig): FileLineResult[] {
  const targetDirs = config?.targetDirs ?? DEFAULT_CONFIG.targetDirs;
  const ignoreDirs = new Set(config?.ignoreDirs ?? DEFAULT_CONFIG.ignoreDirs);
  const results: FileLineResult[] = [];

  function traverse(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (ignoreDirs.has(entry.name) || entry.name.startsWith('.')) {
        if (!entry.name.startsWith('.agents') || currentDir !== rootDir) {
          if (entry.name.startsWith('.') && entry.name !== '.agents') continue;
        }
      }

      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) {
          traverse(fullPath);
        }
      } else if (entry.isFile()) {
        // Only inspect text/source files
        const ext = path.extname(entry.name).toLowerCase();
        const validExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.sql', '.yaml', '.yml'];
        if (validExts.includes(ext) || entry.name === 'AGENTS.md') {
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const relPath = path.relative(rootDir, fullPath);
            results.push(inspectFileContent(relPath, content, config));
          } catch {
            // Ignore unreadable or binary files
          }
        }
      }
    }
  }

  for (const target of targetDirs) {
    traverse(path.join(rootDir, target));
  }

  // Also check root files like AGENTS.md, package.json
  const rootFiles = ['AGENTS.md', 'package.json', 'wrangler.jsonc', 'tsconfig.json'];
  for (const file of rootFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      results.push(inspectFileContent(file, content, config));
    }
  }

  return results;
}

export function summarizeInspection(results: FileLineResult[], isStrict = false): InspectionSummary {
  const hardViolations = results.filter((r) => r.isHardViolation);
  const softViolations = results.filter((r) => r.isSoftViolation);

  let maxLineFile: FileLineResult | null = null;
  for (const res of results) {
    if (!maxLineFile || res.lineCount > maxLineFile.lineCount) {
      maxLineFile = res;
    }
  }

  const hasErrors = hardViolations.length > 0 || (isStrict && softViolations.length > 0);

  return {
    scannedFiles: results.length,
    hardViolations,
    softViolations,
    maxLineFile,
    hasErrors,
  };
}
