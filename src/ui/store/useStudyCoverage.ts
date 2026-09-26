import { create } from 'zustand'
import type { CoverageResult } from '../../domain/models/StudyCoverage.ts'
import { BrowserStudyCoverage } from '../../infra/cache/BrowserStudyCoverage.ts'

interface CoverageState {
  results: CoverageResult[]
  storageAvailable: boolean
  record: (result: CoverageResult) => void
  clear: () => void
}

export function createStudyCoverageStore(storage = new BrowserStudyCoverage()) {
  return create<CoverageState>((set, get) => ({
    ...storage.load(),
    record: (result) => {
      const results = [...get().results.filter((item) => item.questionId !== result.questionId), result]
      const storageAvailable = storage.save(results)
      set({ results, storageAvailable })
    },
    clear: () => {
      const storageAvailable = storage.clear()
      set({ results: [], storageAvailable })
    },
  }))
}

export const useStudyCoverage = createStudyCoverageStore()
