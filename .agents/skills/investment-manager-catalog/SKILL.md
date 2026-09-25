---
name: investment-manager-catalog
description: Plan or implement a catalog of the 2026 Investment Manager standard textbooks and exam blueprint in Cloudflare D1; use when work touches textbook PART/Chapter/SECTION data, exam-topic mappings, or observed question frequency.
---

# Investment Manager Catalog

- Read [ADR 0002](../../../docs/adr/0002-textbook-catalog-and-exam-blueprint.md) and the [catalog plan](../../../docs/plans/2026-investment-manager-catalog-d1.md) before changing this domain.
- Keep textbook edition and table-of-contents hierarchy separate from the exam blueprint. Store their sources and verification dates; do not infer chapter-level frequency from subject-level question allocation.
- Mark unverified mappings and observed-frequency claims as unknown until supported by identifiable evidence. Preserve textbook editions rather than overwriting prior catalogs.
- 1단계 구현(2026년 교재 1~5권 28 PART, 125 Chapter 스키마, 시드, API, 조회 UI `/catalog`)이 완료되었다.
- 교재 판본 및 목차 계층(1~5권)과 시험 출제기준(3과목 17세부과목)은 계속해서 엄격히 분리하여 관리한다. 세부과목별 문항 배분을 임의로 장·절 단위 빈도로 단정하지 않는다.
- 미확인 매핑이나 외부 조언은 잠정(PROVISIONAL) 또는 미확인으로 명시하고, 각 과목별 과락선(40%)과 전체 합격선(70점)을 명확히 안내한다.
- 향후 2단계 확장(456개 SECTION 원문 대조 전체 수집, 회차별 기출 문항 매핑 등) 시에도 구현 범위와 데이터 출처를 사전에 사용자에게 확인하고 진행한다.
- RAG·문제 학습은 [ADR 0003](../../../docs/adr/0003-adaptive-question-rag-study.md)과 [학습 설계](../../../docs/plans/rag-question-study-design.md)를 따른다. 세부과목 배분과 관측 출제 빈도를 분리하고, 근거 없는 장·절 빈도는 계산하지 않는다.
