import type { CoverageResult } from '../../domain/models/StudyCoverage.ts'

export const COVERAGE_STORAGE_KEY = 'touyousha.study-coverage.2026.v1'
type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function isResult(value: unknown): value is CoverageResult {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<CoverageResult>
  return typeof item.questionId === 'string' && item.questionId.length > 0
    && typeof item.topicId === 'string' && item.topicId.length > 0
    && typeof item.isCorrect === 'boolean' && typeof item.hintUsed === 'boolean'
}

export class BrowserStudyCoverage {
  private readonly access: StorageAccess

  constructor(access: StorageAccess = () => window.localStorage) {
    this.access = access
  }

  load(): { results: CoverageResult[]; storageAvailable: boolean } {
    try {
      const raw = this.access().getItem(COVERAGE_STORAGE_KEY)
      if (!raw) return { results: [], storageAvailable: true }
      const data: unknown = JSON.parse(raw)
      if (!Array.isArray(data) || !data.every(isResult)) throw new Error('Invalid coverage data')
      return { results: data, storageAvailable: true }
    } catch {
      return { results: [], storageAvailable: false }
    }
  }

  save(results: readonly CoverageResult[]): boolean {
    try {
      this.access().setItem(COVERAGE_STORAGE_KEY, JSON.stringify(results))
      return true
    } catch {
      return false
    }
  }

  clear(): boolean {
    try {
      this.access().removeItem(COVERAGE_STORAGE_KEY)
      return true
    } catch {
      return false
    }
  }
}
