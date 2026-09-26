import ky from 'ky'
import type { CoverageResult } from '../../domain/models/StudyCoverage.ts'

export function fetchStudyCoverage(): Promise<{ results: CoverageResult[] }> {
  return ky.get('/api/study/coverage', { timeout: 10000, retry: 1 }).json()
}
