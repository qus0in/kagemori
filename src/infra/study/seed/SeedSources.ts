// src/infra/study/seed/SeedSources.ts
import type { SourceDocument } from '../../../domain/ports/SourceRepository.ts'

export const SEED_SOURCES: SourceDocument[] = [
  {
    id: 'src-law-cma',
    title: '자본시장과 금융투자업에 관한 법률 (약칭: 자본시장법)',
    url: 'https://www.law.go.kr/법령/자본시장과금융투자업에관한법률',
    publisher: '법제처',
  },
  {
    id: 'src-kofia-ethics',
    title: '금융투자전문인력 직무윤리강령',
    url: 'https://www.kofia.or.kr',
    publisher: '한국금융투자협회',
  },
  {
    id: 'src-law-tax',
    title: '소득세법 (금융소득 종합과세 및 배당소득)',
    url: 'https://www.law.go.kr/법령/소득세법',
    publisher: '법제처',
  },
  {
    id: 'src-kofia-stock',
    title: '2026 투자자산운용사 제4권 주식운용 및 투자전략',
    url: 'https://www.kofia.or.kr',
    publisher: '한국금융투자협회',
  },
]
