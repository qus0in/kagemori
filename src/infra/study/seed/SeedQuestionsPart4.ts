// src/infra/study/seed/SeedQuestionsPart4.ts
import { Question } from '../../../domain/models/Question.ts'

export const SEED_QUESTIONS_PART4: Question[] = [
  new Question({
    id: 'q-cma-007',
    version: 1,
    topicId: 'topic-3-1',
    chapterId: 'c3-01-01',
    type: 'REGULATION',
    difficulty: 'EASY',
    status: 'PUBLISHED',
    prompt: '금융투자업 전문인력의 직무윤리 기본원칙인 신의성실의 원칙과 충실의무에 관한 설명으로 가장 적절하지 않은 것은?',
    options: [
      {
        id: 'opt-7-1',
        text: '금융투자전문인력은 금융소비자의 신뢰를 바탕으로 직무를 성실히 수행해야 한다.',
      },
      {
        id: 'opt-7-2',
        text: '고객과 금융투자업자 사이에 이해상충이 발생할 우려가 있는 경우 고객의 이익을 최우선으로 고려해야 한다.',
      },
      {
        id: 'opt-7-3',
        text: '전문인력 본인의 사적 투자 이익은 고객의 투자 이익보다 항상 우선하여 보호받을 권리가 있다.',
      },
      {
        id: 'opt-7-4',
        text: '충실의무(Fiduciary Duty)에 따라 고객의 자산을 선량한 관리자의 주의의무를 다하여 관리해야 한다.',
      },
    ],
    correctOptionId: 'opt-7-3',
    explanation:
      '직무윤리의 충실의무상 금융투자전문인력은 고객의 이익을 최우선(Customer First)으로 두어야 하며, 본인 또는 제3자의 이익을 고객의 이익보다 우선시하는 행위는 엄격히 금지됩니다.',
    conceptId: 'concept-cma-07',
    sourceId: 'src-kofia-ethics',
  }),
  new Question({
    id: 'q-cma-008',
    version: 1,
    topicId: 'topic-3-1',
    chapterId: 'c3-01-02',
    type: 'CONCEPT',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: '금융투자업 직무윤리에서 요구되는 이해상충(Conflict of Interest) 방지 및 관리에 관한 설명으로 옳은 것은?',
    options: [
      {
        id: 'opt-8-1',
        text: '이해상충 발생 가능성을 고객에게 사전에 알리지 않고 자체적으로만 은밀히 처리해야 한다.',
      },
      {
        id: 'opt-8-2',
        text: '이해상충이 불가피할 때에는 회사의 이익을 고객의 이익보다 우선하여 보호해야 한다.',
      },
      {
        id: 'opt-8-3',
        text: '이해상충이 발생할 가능성이 있는 경우 법령에 따라 고객에게 그 사실을 알리고 거래를 진행하거나 회피해야 한다.',
      },
      {
        id: 'opt-8-4',
        text: '모든 금융상품 거래는 구조상 항상 완전한 이해일치가 이루어지므로 이해상충 방지 체계는 불필요하다.',
      },
    ],
    correctOptionId: 'opt-8-3',
    explanation:
      '금융투자업자는 이해상충이 발생할 가능성이 있는 경우 이를 사전에 고객에게 충실히 고지하고, 고객의 이익이 침해되지 않도록 거래를 회피하거나 합리적인 방법으로 관리해야 합니다.',
    conceptId: 'concept-cma-07',
    sourceId: 'src-kofia-ethics',
  }),
  new Question({
    id: 'q-cma-009',
    version: 1,
    topicId: 'topic-1-1',
    chapterId: 'c1-01-03',
    type: 'REGULATION',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: '소득세법상 금융소득 종합과세 제도에 대한 설명으로 가장 올바른 것은?',
    options: [
      {
        id: 'opt-9-1',
        text: '이자소득과 배당소득의 합계액이 개인별 연간 2,000만 원 이하인 경우 원천징수로 분리과세가 종결된다.',
      },
      {
        id: 'opt-9-2',
        text: '연간 금융소득이 2,000만 원을 초과하면 금융소득 전액이 14% 단일 세율로만 분리과세된다.',
      },
      {
        id: 'opt-9-3',
        text: '국내 상장주식의 소액주주 장내 양도차익은 현행 소득세법상 금융소득 종합과세 대상에 포함된다.',
      },
      {
        id: 'opt-9-4',
        text: '금융소득 종합과세 기준금액은 개인별이 아닌 세대별 금융소득을 모두 합산하여 산정한다.',
      },
    ],
    correctOptionId: 'opt-9-1',
    explanation:
      '소득세법상 금융소득(이자소득+배당소득)은 개인별 연간 2,000만 원 이하일 때 14%(지방소득세 포함 15.4%) 원천징수로 분리과세 종결되며, 2,000만 원 초과분은 다른 종합소득과 합산 과세됩니다. 부부합산이 아닌 개인별 과세입니다.',
    conceptId: 'concept-cma-08',
    sourceId: 'src-law-tax',
  }),
]
