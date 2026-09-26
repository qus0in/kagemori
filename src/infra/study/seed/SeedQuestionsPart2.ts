// src/infra/study/seed/SeedQuestionsPart2.ts
import { Question } from '../../../domain/models/Question.ts'

export const SEED_QUESTIONS_PART2: Question[] = [
  new Question({
    id: 'q-cma-003',
    version: 1,
    topicId: 'topic-3-2',
    chapterId: 'c3-02-04',
    type: 'CONCEPT',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: '자본시장법상 집합투자기구(펀드)의 요건 및 법적 형태에 관한 설명으로 옳은 것은?',
    options: [
      {
        id: 'opt-3-1',
        text: '투자자로부터 일상적인 운용지시를 받으면서 재산을 운용하는 기구이다.',
      },
      {
        id: 'opt-3-2',
        text: '투자신탁 형태는 상법상 주식회사 형태로 설립되는 회사형 집합투자기구이다.',
      },
      {
        id: 'opt-3-3',
        text: '2인 이상의 투자자에게 투자권유를 하여 모은 금전 등을 일상적 운용지시 없이 전문적으로 운용하고 배분하는 기구이다.',
      },
      {
        id: 'opt-3-4',
        text: '조합형 집합투자기구로는 투자유한회사와 투자합자회사가 있다.',
      },
    ],
    correctOptionId: 'opt-3-3',
    explanation:
      '자본시장법 제9조 제18항에 따라 집합투자기구는 2인 이상의 투자자에게 투자권유를 하여 모은 금전등을 투자자의 일상적인 운용지시를 받지 아니하고 전문적으로 운용하여 귀속시키는 기구입니다.',
    conceptId: 'concept-cma-03',
    sourceId: 'src-law-cma',
  }),
  new Question({
    id: 'q-cma-004',
    version: 1,
    topicId: 'topic-3-2',
    chapterId: 'c3-02-06',
    type: 'REGULATION',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: "자본시장법상 투자권유 규제인 '적합성 원칙(Suitability)'에 관한 설명으로 가장 올바른 것은?",
    options: [
      { id: 'opt-4-1', text: '전문투자자를 포함한 모든 투자자에게 의무적으로 적용된다.' },
      {
        id: 'opt-4-2',
        text: '일반투자자에게 투자권유를 하기 전 투자목적, 재산상황, 투자경험 등을 파악하고 서명 등으로 확인받아야 한다.',
      },
      { id: 'opt-4-3', text: '투자권유를 하지 않고 단순 매매를 요청하는 일반투자자에게 적용되는 원칙이다.' },
      {
        id: 'opt-4-4',
        text: '투자자가 정보 제공을 거부하는 경우 금융투자업자는 임의로 성향을 추정하여 공격적 투자권유를 할 수 있다.',
      },
    ],
    correctOptionId: 'opt-4-2',
    explanation:
      '자본시장법 제46조에 따라 적합성 원칙은 일반투자자에게 투자권유를 하기 전에 정보를 파악하여 서명 등으로 확인받고, 적합하지 아니한 투자권유를 금지합니다. 전문투자자는 원칙적으로 적용이 배제됩니다.',
    conceptId: 'concept-cma-04',
    sourceId: 'src-law-cma',
  }),
]
