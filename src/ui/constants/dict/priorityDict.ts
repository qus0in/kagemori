import { priorityGroupA } from './priorityGroupADict.ts'
import { priorityGroupB } from './priorityGroupBDict.ts'

export const priorityDict = {
  warningTitle: '⚠️ 잠정 학습 우선순위 안내',
  warningDesc:
    '본 우선순위는 시험 공식 세부과목별 문항 배분과 주요 교육기관의 수험 전략 조언을 바탕으로 정리한 추론형 가이드입니다. 과거 기출문제 실측 빈도 자료가 아니므로 특정 절을 임의로 생략하지 마시고, 특히 1·2과목의 과락선(8/20, 12/30)에 각별히 유의하십시오.',
  groupA: priorityGroupA,
  groupB: priorityGroupB,
} as const
