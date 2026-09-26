// src/infra/study/seed/SeedQuestionsPart3.ts
import { Question } from '../../../domain/models/Question.ts'

export const SEED_QUESTIONS_PART3: Question[] = [
  new Question({
    id: 'q-cma-005',
    version: 1,
    topicId: 'topic-3-2',
    chapterId: 'c3-02-07',
    type: 'REGULATION',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    prompt: '자본시장법상 금융투자업자의 설명의무(제47조)에 관한 설명으로 옳지 않은 것은?',
    options: [
      { id: 'opt-5-1', text: "일반투자자가 '설명을 듣지 않겠다'고 서면으로 요청하면 설명의무가 면제된다." },
      { id: 'opt-5-2', text: '투자권유 시 금융투자상품의 중요 내용과 위험을 일반투자자가 이해할 수 있도록 설명하여야 한다.' },
      { id: 'opt-5-3', text: '설명의무 위반으로 일반투자자에게 손해가 발생한 경우 원본손실액을 손해액으로 추정한다.' },
      { id: 'opt-5-4', text: '설명 시 투자설명서 등의 설명자료를 일반투자자에게 교부하여야 한다.' },
    ],
    correctOptionId: 'opt-5-1',
    explanation:
      '설명의무는 강행규정으로, 투자자가 설명을 거부하거나 원하지 않는다는 의사를 밝히더라도 투자권유를 하는 이상 설명의무 자체가 면제되지 않습니다.',
    conceptId: 'concept-cma-05',
    sourceId: 'src-law-cma',
  }),
  new Question({
    id: 'q-cma-006',
    version: 1,
    topicId: 'topic-3-2',
    chapterId: 'c3-02-10',
    type: 'REGULATION',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    prompt: '자본시장법상 집합투자재산의 분산투자 규제(제80조 동일법인 증권 투자한도)에 관한 설명으로 옳은 것은?',
    options: [
      { id: 'opt-6-1', text: '동일법인이 발행한 지분증권에 한하여 10% 규제가 적용되며, 채무증권은 무제한 투자할 수 있다.' },
      { id: 'opt-6-2', text: '국채 및 한국은행 통화안정증권 등 대통령령으로 정하는 국공채도 예외 없이 10% 한도가 적용된다.' },
      {
        id: 'opt-6-3',
        text: '집합투자업자는 각 집합투자기구 자산총액의 10%를 초과하여 동일법인 등이 발행한 증권에 투자할 수 없는 것이 원칙이다.',
      },
      { id: 'opt-6-4', text: '사모펀드의 경우 동일법인 증권 투자한도가 5%로 더욱 엄격하게 제한된다.' },
    ],
    correctOptionId: 'opt-6-3',
    explanation:
      '자본시장법 제80조에 따라 각 집합투자기구 자산총액의 10%를 초과하여 동일법인 등이 발행한 증권에 투자할 수 없으나, 국채·통안채 등 우량 국공채는 10% 한도 적용이 배제됩니다.',
    conceptId: 'concept-cma-06',
    sourceId: 'src-law-cma',
  }),
]
