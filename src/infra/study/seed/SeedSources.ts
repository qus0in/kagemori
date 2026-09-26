// src/infra/study/seed/SeedSources.ts
import type { SourceDocument } from '../../../domain/ports/SourceRepository.ts'

export const SEED_SOURCES: SourceDocument[] = [
  {
    id: 'src-law-cma',
    title: '자본시장과 금융투자업에 관한 법률 (약칭: 자본시장법)',
    url: 'https://www.law.go.kr/법령/자본시장과금융투자업에관한법률',
    publisher: '법제처',
  },
]
