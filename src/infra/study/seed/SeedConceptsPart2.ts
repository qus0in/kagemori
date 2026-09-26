// src/infra/study/seed/SeedConceptsPart2.ts
import { Concept } from '../../../domain/models/Concept.ts'

export const SEED_CONCEPTS_PART2: Concept[] = [
  new Concept({
    conceptId: 'concept-cma-04',
    topicId: 'topic-3-2',
    chapterId: 'c3-02-06',
    title: '적합성 원칙(Suitability) 및 적정성 원칙(Appropriateness)',
    body: '자본시장법 제46조에 따른 적합성 원칙은 일반투자자에게 투자권유를 하기 전에 면담·질문 등을 통하여 투자목적, 재산상황, 투자경험 등을 파악하고 서명 등의 방법으로 확인을 받아 보관하여야 하며, 투자자에게 적합하지 않은 투자권유를 금지하는 원칙이다. 전문투자자에게는 원칙적으로 적용이 배제된다. 반면 제46조의2 적정성 원칙은 투자권유 없이 파생상품 등을 매수하려는 일반투자자의 정보를 파악하여 부적정하다고 판단되는 경우 경고하는 제도이다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-law-cma',
    locator: '제46조(적합성의 원칙)',
  }),
  new Concept({
    conceptId: 'concept-cma-05',
    topicId: 'topic-3-2',
    chapterId: 'c3-02-07',
    title: '금융투자업자의 설명의무 및 위반 시 손해배상책임',
    body: '자본시장법 제47조에 따라 금융투자업자는 일반투자자에게 투자권유를 하는 경우 금융투자상품의 내용, 투자위험 등을 일반투자자가 이해할 수 있도록 설명하고 설명서를 교부해야 한다. 투자자가 설명을 원하지 않는다고 하더라도 설명의무 자체가 면제되지 아니하며, 거짓 설명이나 왜곡된 설명이 금지된다. 설명의무 위반 시 제48조에 따라 손해배상책임이 발생하며, 손해액은 원본손실액으로 추정된다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-law-cma',
    locator: '제47조(설명의무) 및 제48조(손해배상책임)',
  }),
  new Concept({
    conceptId: 'concept-cma-06',
    topicId: 'topic-3-2',
    chapterId: 'c3-02-10',
    title: '집합투자재산의 동일종목 투자한도(10% 규제)',
    body: '자본시장법 제80조에 따라 집합투자업자는 각 집합투자기구 자산총액의 10%를 초과하여 동일법인 등이 발행한 증권에 투자할 수 없다(10% 분산투자 규제). 다만 국채, 한국은행 통화안정증권 등 안정성이 높은 대통령령이 정하는 증권의 경우에는 10% 한도의 적용이 배제된다.',
    status: 'PUBLISHED',
    version: 1,
    sourceId: 'src-law-cma',
    locator: '제80조(집합투자재산의 운용제한)',
  }),
]
