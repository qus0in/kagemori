// src/infra/study/seed/SeedQuestionsPart1.ts
import { Question } from '../../../domain/models/Question.ts'

export const SEED_QUESTIONS_PART1: Question[] = [
  new Question({
    id: 'q-cma-001',
    version: 1,
    topicId: 'topic-3-2',
    chapterId: 'c3-02-01',
    type: 'REGULATION',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: '자본시장법상 금융투자상품의 개념과 분류에 관한 설명으로 가장 올바르지 않은 것은?',
    options: [
      {
        id: 'opt-1-1',
        text: '금융투자상품은 투자원금을 초과하는 손실을 볼 위험이 있는 파생상품과 원본손실위험만 있는 증권으로 대별된다.',
      },
      {
        id: 'opt-1-2',
        text: '원화로 표시된 양도성 예금증서(CD)는 원본손실위험이 있어 자본시장법상 금융투자상품에 포함된다.',
      },
      {
        id: 'opt-1-3',
        text: '금융투자상품이란 이익을 얻거나 손실을 회피할 목적으로 금전 등을 지급하기로 약정하고 취득하는 권리로서 원본손실위험(투자성)이 있는 것이다.',
      },
      {
        id: 'opt-1-4',
        text: '투자계약증권과 파생결합증권은 자본시장법상 증권의 한 종류에 해당한다.',
      },
    ],
    correctOptionId: 'opt-1-2',
    explanation:
      '원화로 표시된 양도성 예금증서(CD), 신탁업자의 수익권(일부 예외), 주택저당채권담보부채권은 자본시장법 제3조 제1항 단서에 의해 금융투자상품의 범위에서 명시적으로 제외됩니다.',
    conceptId: 'concept-cma-01',
    sourceId: 'src-law-cma',
  }),
  new Question({
    id: 'q-cma-002',
    version: 1,
    topicId: 'topic-3-2',
    chapterId: 'c3-02-02',
    type: 'CONCEPT',
    difficulty: 'EASY',
    status: 'PUBLISHED',
    prompt: '자본시장법상 규정된 증권의 6대 분류에 해당하지 않는 것은?',
    options: [
      { id: 'opt-2-1', text: '지분증권' },
      { id: 'opt-2-2', text: '투자계약증권' },
      { id: 'opt-2-3', text: '파생결합증권' },
      { id: 'opt-2-4', text: '장외파생증권' },
    ],
    correctOptionId: 'opt-2-4',
    explanation:
      '자본시장법 제4조에서 정한 증권의 6대 종류는 채무증권, 지분증권, 수익증권, 투자계약증권, 파생결합증권, 증권예탁증권입니다. 장외파생은 파생상품의 분류이며 증권의 분류가 아닙니다.',
    conceptId: 'concept-cma-02',
    sourceId: 'src-law-cma',
  }),
]
