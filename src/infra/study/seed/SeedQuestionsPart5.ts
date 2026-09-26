// src/infra/study/seed/SeedQuestionsPart5.ts
import { Question } from '../../../domain/models/Question.ts'

export const SEED_QUESTIONS_PART5: Question[] = [
  new Question({
    id: 'q-cma-010',
    version: 1,
    topicId: 'topic-1-1',
    chapterId: 'c1-01-03',
    type: 'APPLICATION',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    prompt: '집합투자기구(펀드)의 분배금 및 세제에 관한 설명으로 가장 올바르지 않은 것은?',
    options: [
      {
        id: 'opt-10-1',
        text: '집합투자기구로부터 받는 이익(결산분배금 및 환매차익)은 원칙적으로 소득세법상 배당소득으로 과세된다.',
      },
      {
        id: 'opt-10-2',
        text: '국내 주식형 공모펀드의 경우 펀드가 보유한 국내 상장주식의 매매·평가손익은 과세대상 소득에서 제외된다.',
      },
      {
        id: 'opt-10-3',
        text: '집합투자기구의 손실이 발생하여 원금이 줄어든 상태에서도 다른 과세대상 이익이 있다면 세금이 부과될 수 있다.',
      },
      {
        id: 'opt-10-4',
        text: '해외 주식형 펀드에서 발생하는 해외 상장주식 매매차익은 비과세 대상이므로 배당소득세가 전혀 부과되지 않는다.',
      },
    ],
    correctOptionId: 'opt-10-4',
    explanation:
      '국내 주식형 공모펀드의 상장주식 매매평가손익은 과세대상이 아니지만, 해외 주식형 펀드의 해외 주식 매매차익은 과세표준 기준가격에 반영되어 배당소득세 과세대상에 해당합니다.',
    conceptId: 'concept-cma-08',
    sourceId: 'src-law-tax',
  }),
  new Question({
    id: 'q-cma-011',
    version: 1,
    topicId: 'topic-3-5',
    chapterId: 'c4-01-06',
    type: 'CONCEPT',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    prompt: '마코위츠(Markowitz)의 포트폴리오 이론에서 상관계수(Correlation Coefficient)와 분산투자 효과에 관한 설명으로 옳은 것은?',
    options: [
      {
        id: 'opt-11-1',
        text: '두 자산 수익률 간의 상관계수가 +1인 경우 분산투자를 통해 비체계적 위험을 완전히 제거할 수 있다.',
      },
      {
        id: 'opt-11-2',
        text: '상관계수가 1보다 작기만 하면 자산 간 결합을 통해 포트폴리오의 분산(위험)을 감소시킬 수 있다.',
      },
      {
        id: 'opt-11-3',
        text: '상관계수가 -1인 경우에도 포트폴리오의 총위험은 절대 0이 될 수 없다.',
      },
      {
        id: 'opt-11-4',
        text: '자산 수가 무한히 증가하면 시장 위험인 체계적 위험까지 모두 0으로 축소된다.',
      },
    ],
    correctOptionId: 'opt-11-2',
    explanation:
      '두 자산 간 상관계수가 1보다 작은 경우(ρ < 1) 포트폴리오 결합을 통한 분산투자 효과가 발생하며, 상관계수가 -1일 때 위험 감소 효과가 극대화됩니다.',
    conceptId: 'concept-cma-09',
    sourceId: 'src-kofia-stock',
  }),
  new Question({
    id: 'q-cma-012',
    version: 1,
    topicId: 'topic-3-5',
    chapterId: 'c4-01-06',
    type: 'APPLICATION',
    difficulty: 'HARD',
    status: 'PUBLISHED',
    prompt: '주식 포트폴리오 운용 시 고려하는 체계적 위험(Systematic Risk)과 비체계적 위험(Unsystematic Risk)에 대한 설명으로 옳은 것은?',
    options: [
      {
        id: 'opt-12-1',
        text: '개별 기업의 노사분규, 경영진 교체, 소송 등 개별 요인에 기인하는 위험은 체계적 위험이다.',
      },
      {
        id: 'opt-12-2',
        text: '경기변동, 금리인상, 환율급변 등 거시경제 충격에 의해 발생하는 위험은 비체계적 위험이다.',
      },
      {
        id: 'opt-12-3',
        text: '비체계적 위험은 다양한 종목에 분산투자함으로써 거의 0에 가깝게 제거할 수 있다.',
      },
      {
        id: 'opt-12-4',
        text: '자본자산가격결정모형(CAPM)에서는 투자자가 비체계적 위험을 감수하는 것에 대해서도 위험프리미엄 보상을 제공한다.',
      },
    ],
    correctOptionId: 'opt-12-3',
    explanation:
      '비체계적 위험(기업 고유 위험)은 분산투자를 통해 제거 가능합니다. 체계적 위험(시장 위험)은 분산투자로 제거할 수 없으며, CAPM에서는 제거 가능한 비체계적 위험에 대해 보상하지 않고 체계적 위험(베타)에 대해서만 프리미엄을 보상합니다.',
    conceptId: 'concept-cma-09',
    sourceId: 'src-kofia-stock',
  }),
]
