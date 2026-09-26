// src/infra/study/seed/SeedConceptsPart3.ts
import { Concept } from '../../../domain/models/Concept.ts'

export const SEED_CONCEPTS_PART3: Concept[] = [
  new Concept({
    conceptId: 'concept-cma-07',
    topicId: 'topic-3-1',
    chapterId: 'c3-01-01',
    title: '직무윤리의 기본원칙(신의성실 및 충실의무)',
    body: '금융투자전문인력은 금융소비자의 신뢰를 확보하고 자본시장의 공정성을 유지하기 위해 신의성실의 원칙을 가장 기본적인 행동강령으로 삼아야 한다. 고객과의 이해상충을 방지하고 고객의 이익을 최우선으로 고려해야 하는 충실의무(Fiduciary Duty)가 적용되며, 자기 또는 제3자의 이익을 고객의 이익에 우선시해서는 안 된다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-kofia-ethics',
    locator: '제1장 직무윤리 기본원칙',
  }),
  new Concept({
    conceptId: 'concept-cma-08',
    topicId: 'topic-1-1',
    chapterId: 'c1-01-03',
    title: '금융소득 종합과세 기준 및 배당소득 과세원칙',
    body: '소득세법상 금융소득(이자소득과 배당소득의 합계)이 개인별 연간 2,000만 원 이하인 경우 14%(지방소득세 포함 시 15.4%)의 원천징수 세율로 분리과세 종결된다. 그러나 연간 금융소득이 2,000만 원을 초과하면 초과분이 다른 종합소득과 합산되어 기본세율(누진세율)로 종합과세된다. 집합투자기구(펀드)의 분배금은 배당소득으로 과세된다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-law-tax',
    locator: '소득세법 제14조(과세표준의 계산) 및 제17조(배당소득)',
  }),
  new Concept({
    conceptId: 'concept-cma-09',
    topicId: 'topic-3-5',
    chapterId: 'c4-01-06',
    title: '마코위츠 포트폴리오 이론과 분산투자 효과',
    body: '마코위츠의 현대 포트폴리오 이론에 따르면, 두 자산 간의 상관계수(ρ)가 1보다 작으면 포트폴리오 편입을 통해 기대수익률을 희생하지 않고도 비체계적 위험(고유위험)을 감소시킬 수 있다. 상관계수가 -1일 때 분산투자에 의한 위험감소 효과가 극대화되며, 시장 전체의 변동에 기인하는 체계적 위험은 분산투자로 제거할 수 없다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-kofia-stock',
    locator: '제4권 제1편 제6장 주식 포트폴리오 운용전략',
  }),
]
