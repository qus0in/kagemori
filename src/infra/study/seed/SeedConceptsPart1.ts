// src/infra/study/seed/SeedConceptsPart1.ts
import { Concept } from '../../../domain/models/Concept.ts'

export const SEED_CONCEPTS_PART1: Concept[] = [
  new Concept({
    conceptId: 'concept-cma-01',
    topicId: 'topic-3-2',
    chapterId: 'c3-02-01',
    title: '금융투자상품의 정의 및 투자성(원본손실위험)',
    body: '자본시장법 제3조에 따른 금융투자상품이란 이익을 얻거나 손실을 회피할 목적으로 현재 또는 장래의 특정 시점에 금전 등을 지급하기로 약정함으로써 취득하는 권리로서, 원본손실위험(투자성)이 있는 것을 의미한다. 원본초과손실위험이 없는 것은 증권, 원본초과손실위험이 있는 것은 파생상품으로 분류된다. 단, 원화로 표시된 양도성 예금증서(CD), 신탁업자의 수익권(일부 예외), 주택저당채권담보부채권 등은 금융투자상품에서 제외된다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-law-cma',
    locator: '제3조(금융투자상품)',
  }),
  new Concept({
    conceptId: 'concept-cma-02',
    topicId: 'topic-3-2',
    chapterId: 'c3-02-02',
    title: '증권의 6대 분류 및 파생결합증권의 특성',
    body: '자본시장법 제4조에서 규정하는 증권은 채무증권, 지분증권, 수익증권, 투자계약증권, 파생결합증권, 증권예탁증권의 6종류로 한정된다. 증권은 투자원금을 초과하여 추가적인 손실을 부담하지 않는 특성(원본초과손실 없음)을 가진다. ELS나 DLS는 파생상품적 요소를 결합하였으나 원본초과손실 위험이 없으므로 파생결합증권(증권)으로 분류된다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-law-cma',
    locator: '제4조(증권)',
  }),
  new Concept({
    conceptId: 'concept-cma-03',
    topicId: 'topic-3-2',
    chapterId: 'c3-02-04',
    title: '집합투자기구(펀드)의 법적 형태 및 운용원칙',
    body: '자본시장법 제9조 제18항에 따르면 집합투자기구란 2인 이상에게 투자권유를 하여 모은 금전등을 투자자로부터 일상적인 운용지시를 받지 아니하면서 재산적 가치가 있는 투자대상자산을 취득·처분 등의 방법으로 운용하고 그 결과를 투자자에게 배분하여 귀속시키는 기구이다. 법적 형태로는 투자신탁(계약형/신탁형), 투자회사(주식회사형), 투자유한회사, 투자합자회사, 투자유한책임회사, 투자합자조합, 투자익명조합이 있다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-law-cma',
    locator: '제9조(기타 용어의 정의) 제18항',
  }),
]
