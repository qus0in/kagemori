# 2026 투자자산운용사 1~5권 목차 및 D1 관계형 모델 계획

- 작성일: 2026-09-25 (Asia/Seoul)
- 상태: 1단계 구현 완료 (D1 스키마/시드, Clean Architecture Repository/UseCase/API, 교재·출제기준 반응형 UI)
- 근거 결정: [ADR 0002](../adr/0002-textbook-catalog-and-exam-blueprint.md)
- 범위: 금융투자교육원 2026년 표준교재 1~5권의 **공개 목차 계층**, 시험 과목별 출제기준, D1 모델 계획
- 현재 앱의 일정 카운터 및 API는 변경하지 않는다.

## 목차 조사 결과

5권 합계 **28개 PART, 125개 Chapter, 456개 SECTION**이다. 출처의 `PART/Chapter/SECTION` 표기를 세었으며, Chapter 번호는 PART마다 다시 시작한다. `실전예상문제`는 SECTION으로 세지 않았다. 3권에는 SECTION을 별도로 표시하지 않는 Chapter가 세 개 있다. 아래 번호 범위는 계층과 개수를 보여준다. SECTION 제목·시작 쪽수는 각 링크의 원문에 있으며, 실제 데이터 입력 단계에 원문과 대조해 수집한다. 이 문서는 대량의 목차 텍스트를 재게시하지 않는다.

### 1권 — 12개 PART, 33개 Chapter, 107개 SECTION

ISBN 9788960507845; [공개 목차](https://www.cconma.com/product/PKKOR9788960507845). 각 장의 표기는 SECTION 번호 범위다. SECTION 표기가 없는 장에 절을 새로 만들지 않는다.

- PART 01 금융투자세제
  - Chapter 01 국세기본법 — SECTION 01–06
  - Chapter 02 소득세법 — SECTION 01–07
  - Chapter 03 이자소득, 배당소득 및 양도소득 — SECTION 01–04
  - Chapter 04 증권거래세법 — SECTION 01–02
  - Chapter 05 기타 금융세제 — SECTION 01–01
- PART 02 절세전략
  - Chapter 01 세무전략 : 금융자산 TAX-PLANNING — SECTION 01–07
- PART 03 금융상품개론
  - Chapter 01 금융회사의 종류 — SECTION 01–02
  - Chapter 02 금융상품의 개요 — SECTION 01–02
- PART 04 예금 및 신탁상품
  - Chapter 01 예금의 구분 — SECTION 01–02
  - Chapter 02 예금의 종류 — SECTION 01–03
  - Chapter 03 신탁상품의 개념과 특징 — SECTION 01–02
  - Chapter 04 신탁상품의 종류 — SECTION 01–02
- PART 05 보장성 금융상품
  - Chapter 01 생명보험상품 — SECTION 01–02
  - Chapter 02 손해보험상품 — SECTION 01–02
- PART 06 투자성 금융상품
  - Chapter 01 금융투자상품의 개념 및 종류 — SECTION 01–02
  - Chapter 02 펀드상품 — SECTION 01–05
  - Chapter 03 기타 금융투자상품 — SECTION 01–04
- PART 07 자산유동화 증권의 구조와 사례
  - Chapter 01 자산유동화증권(ABS)의 기본개념 — SECTION 01–03
  - Chapter 02 자산유동화증권의 구조 — SECTION 01–03
  - Chapter 03 자산유동화증권 주요 발행유형 — SECTION 01–04
- PART 08 주택저당증권
  - Chapter 01 주택저당증권(MBS) — SECTION 01–07
- PART 09 퇴직연금
  - Chapter 01 퇴직연금제도 — SECTION 01–06
- PART 10 부동산 개론
  - Chapter 01 부동산 투자의 기초 — SECTION 01–03
  - Chapter 02 부동산 투자의 이해 — SECTION 01–02
  - Chapter 03 부동산의 이용 및 개발 — SECTION 01–02
- PART 11 부동산 투자 상품의 이해
  - Chapter 01 부동산 투자 구분 — SECTION 01–02
  - Chapter 02 부동산 펀드의 이해 — SECTION 01–06
  - Chapter 03 부동산 포트폴리오 — SECTION 01–02
  - Chapter 04 부동산 가치평가 — SECTION 01–03
  - Chapter 05 부동산의 투자가치 분석 — SECTION 01–03
  - Chapter 06 부동산 개발사업 사업타당성 평가 — SECTION 01–02
- PART 12 리츠업무
  - Chapter 01 부동산 간접투자제도의 이해 — SECTION 01–02
  - Chapter 02 부동산 투자회사법의 이해 — SECTION 01–02

### 2권 — 6개 PART, 29개 Chapter, 100개 SECTION

ISBN 9788960507852; [공개 목차](https://www.cconma.com/product/PKKOR9788960507852). 각 장의 표기는 SECTION 번호 범위다.

- PART 01 대안투자운용 및 투자전략
  - Chapter 01 대안투자상품 — SECTION 01–02
  - Chapter 02 부동산 투자 — SECTION 01–03
  - Chapter 03 PEF(Private Equity Fund) — SECTION 01–03
  - Chapter 04 헤지펀드 — SECTION 01–07
  - Chapter 05 특별자산 펀드 — SECTION 01–02
  - Chapter 06 Credit Structure — SECTION 01–03
- PART 02 해외 증권 투자운용 및 투자전략
  - Chapter 01 해외 투자에 대한 이론적 접근 — SECTION 01–02
  - Chapter 02 국제 증권시장 — SECTION 01–02
  - Chapter 03 해외 증권투자전략 — SECTION 01–03
- PART 03 투자분석기법 - 기본적 분석
  - Chapter 01 증권분석의 개념 및 기본체계 — SECTION 01–04
  - Chapter 02 유가증권의 가치평가 — SECTION 01–06
  - Chapter 03 기업분석(재무제표분석) — SECTION 01–10
  - Chapter 04 주식투자 — SECTION 01–04
- PART 04 투자분석기법- 기술적 분석
  - Chapter 01 기술적 분석 — SECTION 01–02
  - Chapter 02 추세분석 — SECTION 01–08
  - Chapter 03 패턴 분석 — SECTION 01–03
  - Chapter 04 캔들 차트 분석 — SECTION 01–02
  - Chapter 05 지표 분석 — SECTION 01–03
  - Chapter 06 엘리어트 파동이론 — SECTION 01–04
- PART 05 투자분석기법- 산업분석
  - Chapter 01 산업분석 개요 — SECTION 01–03
  - Chapter 02 산업구조 변화 분석 — SECTION 01–02
  - Chapter 03 산업연관분석(Input-Output Analysis) — SECTION 01–03
  - Chapter 04 라이프사이클 분석(Life Cycle Analysis) — SECTION 01–03
  - Chapter 05 경기순환 분석(Business Cycle Analysis) — SECTION 01–02
  - Chapter 06 산업경쟁력 분석 — SECTION 01–02
  - Chapter 07 산업정책 분석 — SECTION 01–02
- PART 06 리스크 관리
  - Chapter 01 리스크와 리스크 관리의 필요성 — SECTION 01–02
  - Chapter 02 시장 리스크(Market Risk)의 측정 — SECTION 01–04
  - Chapter 03 신용 리스크(Credit Risk)의 측정 — SECTION 01–04

### 3권 — 4개 PART, 27개 Chapter, 100개 SECTION

ISBN 9788960507869; [공개 목차](https://www.cconma.com/product/PKKOR9788960507869). 각 장의 표기는 SECTION 번호 범위다.

- PART 01 직무윤리
  - Chapter 01 직무윤리 일반 — SECTION 01–02
  - Chapter 02 금융투자업 직무윤리 — SECTION 01–04
  - Chapter 03 직무윤리의 준수절차 및 위반 시의 제재 — SECTION 01–02
- PART 02 자본시장과 금융투자업에 관한 법률/금융위원회규정
  - Chapter 01 총설 — SECTION 01–03
  - Chapter 02 금융투자상품 및 금융투자업 — SECTION 01–03
  - Chapter 03 금융투자업자에 대한 규제 · 감독 — SECTION 01–05
  - Chapter 04 투자매매업자 및 투자중개업자에 대한 영업행위규제 — SECTION 01–07
  - Chapter 05 집합투자업자의 영업행위 규칙 — SECTION 01–01
  - Chapter 06 투자자문업자 및 투자일임업자의 영업행위 규칙 — SECTION 01–01
  - Chapter 07 신탁업자의 영업행위 규칙 — SECTION 01–02
  - Chapter 08 증권 발행시장 공시제도 — SECTION 01–03
  - Chapter 09 증권 유통시장 공시제도 — SECTION 01–04
  - Chapter 10 기업의 인수합병(M&A) 관련 제도 — SECTION 01–05
  - Chapter 11 집합투자기구(총칙) — SECTION 01–06
  - Chapter 12 집합투자기구의 구성 등 — SECTION 01–08
  - Chapter 13 집합투자기구 관련 금융위원회 규정 — SECTION 표기 없음
  - Chapter 14 장외거래 및 주식 소유제한 — SECTION 01–03
  - Chapter 15 불공정거래행위에 대한 규제 — SECTION 01–05
  - Chapter 16 금융기관 검사 및 제재에 관한 규정 — SECTION 표기 없음
  - Chapter 17 자본시장 조사업무규정 — SECTION 표기 없음
- PART 03 한국금융투자협회 규정
  - Chapter 01 금융투자회사의 영업 및 업무에 관한 규정 — SECTION 01–14
  - Chapter 02 금융투자전문인력과 자격시험에 관한 규정 — SECTION 01–04
  - Chapter 03 증권 인수업무 등에 관한 규정 — SECTION 01–03
  - Chapter 04 금융투자회사의 약관운용에 관한 규정 — SECTION 표기 없음
- PART 04 금융소비자 보호법
  - Chapter 01 금융소비자보호법 제정 배경 — SECTION 01–02
  - Chapter 02 금융소비자보호법 개관 — SECTION 01–07
  - Chapter 03 금융소비자보호법 주요내용 — SECTION 01–06

### 4권 — 4개 PART, 26개 Chapter, 110개 SECTION

ISBN 9788960507876; [공개 목차](https://www.cconma.com/product/PKKOR9788960507876). 각 장의 표기는 SECTION 번호 범위다.

- PART 01 주식투자운용 및 투자전략
  - Chapter 01 운용과정과 주식투자 — SECTION 01–03
  - Chapter 02 자산배분 전략의 정의 및 준비사항 — SECTION 01–04
  - Chapter 03 전략적 자산배분 — SECTION 01–05
  - Chapter 04 전술적 자산배분 — SECTION 01–05
  - Chapter 05 보험자산배분 — SECTION 01–05
  - Chapter 06 주식 포트폴리오 운용전략 — SECTION 01–07
  - Chapter 07 주식 포트폴리오 구성의 실제 — SECTION 01–04
- PART 02 채권투자운용 및 투자전략
  - Chapter 01 채권의 개요와 채권시장 — SECTION 01–05
  - Chapter 02 채권 가격결정과 채권수익률 — SECTION 01–04
  - Chapter 03 듀레이션과 볼록성 — SECTION 01–03
  - Chapter 04 금리체계 — SECTION 01–03
  - Chapter 05 채권운용전략 — SECTION 01–05
- PART 03 파생상품투자운용 및 투자전략
  - Chapter 01 파생상품 개요 — SECTION 01–02
  - Chapter 02 선도거래와 선물거래의 기본 메커니즘 — SECTION 01–03
  - Chapter 03 선물 총론 — SECTION 01–03
  - Chapter 04 옵션 기초 — SECTION 01–03
  - Chapter 05 옵션을 이용한 합성전략 — SECTION 01–05
  - Chapter 06 옵션 프리미엄과 풋-콜 패리티 — SECTION 01–03
  - Chapter 07 옵션 가격결정 — SECTION 01–06
  - Chapter 08 옵션 및 옵션 합성 포지션의 분석 — SECTION 01–02
- PART 04 투자운용 결과분석
  - Chapter 01 서론 — SECTION 01–04
  - Chapter 02 성과평가 기초사항 — SECTION 01–03
  - Chapter 03 기준 지표 — SECTION 01–06
  - Chapter 04 위험조정 성과지표 — SECTION 01–07
  - Chapter 05 성과 특성 분석 — SECTION 01–07
  - Chapter 06 성과 발표 방법 — SECTION 01–03

### 5권 — 2개 PART, 10개 Chapter, 39개 SECTION

ISBN 9788960507883; [공개 목차](https://i-screammall.co.kr/goods/detail/11180175). 각 장의 표기는 SECTION 번호 범위다.

- PART 01 거시경제분석
  - Chapter 01 경제모형과 경제정책의 분석: IS-LM 모형 — SECTION 01–07
  - Chapter 02 이자율의 결정과 기간구조 — SECTION 01–04
  - Chapter 03 이자율의 변동요인 분석 — SECTION 01–03
  - Chapter 04 경기변동과 경기예측 — SECTION 01–04
- PART 02 분산투자기법
  - Chapter 01 포트폴리오 관리의 기본체계 — SECTION 01–02
  - Chapter 02 포트폴리오 관리 — SECTION 01–06
  - Chapter 03 자본자산 가격결정 모형 — SECTION 01–03
  - Chapter 04 단일 지표 모형 — SECTION 01–04
  - Chapter 05 차익거래 가격결정이론 — SECTION 01–04
  - Chapter 06 포트폴리오 투자전략과 투자성과평가 — SECTION 01–02

## 출제기준과 빈도 조사

[금융투자협회 자격시험센터](https://license.kofia.or.kr/examInfo/examInfo.do?selLicenseCd=FWM006)는 투자자산운용사 시험개요와 표준교재를 안내한다. 과목별 숫자는 현재 렌더링된 공식 페이지의 표를 직접 읽을 수 없어 [2026년 대비 토마토패스의 시험 안내](https://mobile.tomatopass.com/landing/LicenseInvestment.do)에서 확인했다. 따라서 아래 수치는 **공식 표와 대조할 검증 대기 자료**이며, 장·섹션별 실측 빈도가 아니다.

| 과목 | 문항 / 과락 최소 | 세부과목별 문항 |
| --- | ---: | --- |
| 1. 금융상품 및 세제 | 20 / 8 | 세제관련 법규·세무전략 7, 금융상품 8, 부동산관련 상품 5 |
| 2. 투자운용 및 전략 Ⅱ·투자분석 | 30 / 12 | 대안투자 5, 해외증권 5, 투자분석기법 12, 리스크관리 8 |
| 3. 직무윤리 및 법규·투자운용 및 전략 Ⅰ 등 | 50 / 20 | 직무윤리 5, 자본시장법 7, 금융위원회 규정 4, 금융투자협회 규정 3, 주식 6, 채권 6, 파생상품 6, 운용결과분석 4, 거시경제 4, 분산투자기법 5 |

합계 100문항, 시험시간 120분, 총 70점 이상 및 과목별 40% 이상 기준으로 정리한다. 3권 PART 04 금융소비자 보호법은 교재에는 독립 PART로 있지만 위 시험 안내에는 별도 세부과목 행이 없다. 어느 세부과목에 포함되는지는 임의로 확정하지 않는다. 법규와 금융상품 등 교재 PART와 세부과목의 대응도 공식 분류를 확인할 때까지 초안으로만 둔다.

### 빈도 자료의 경계

- **확정 가능한 비중:** 시험 과목·세부과목에 배정된 문항 수. 이는 시험 설계상 배분이며, Chapter나 SECTION의 과거 출제 횟수가 아니다.
- **현재 미확인:** 회차별 원문 문제 또는 검증 가능한 복원 문항을 섹션에 매핑한 자료. 이 자료 없이 “빈출 장·섹션” 순위나 확률을 만들지 않는다.
- **추후 수집:** 회차, 문항 식별자, 원문/복원 여부, 수집원, 복수 섹션 태그, 검토자, 분류 확신도를 기록한다. 기출 복원·교재 업체의 주장만 있는 경우 `분석 자료`로 분리하고 표본 크기·범위를 적는다. 저작권이 있는 문항 원문 저장 여부는 구현 전 별도로 판단한다.

## 잠정 학습 우선순위 (2026-09-25 조사)

아래의 **A는 먼저 반복할 범위, B는 이어서 점검할 범위**다. 출제 확률 순위가 아니다. [토마토패스의 세부과목 문항 배분](https://mobile.tomatopass.com/landing/LicenseInvestment.do)과 [와우패스의 과목별 수험전략](https://www.wowpass.com/FINANCE/FUNDMANAGER/A36S00004001/ExamInfo/235448)을 함께 참고했다. 와우패스는 요약 문장에 시험시간을 150분으로, 같은 페이지의 표에는 120분으로 다르게 적고 있으므로, 정성적 조언만 보조 근거로 사용한다. 교재 SECTION 연결은 공개 목차를 읽고 이 계획에서 **추론**한 것이며, 공식 출제범위의 절 단위 지정이 아니다.

| 우선 | 집중 범위와 근거 | 교재에서 먼저 볼 Chapter·SECTION | 판단 수준 |
| --- | --- | --- | --- |
| A | **투자분석기법 12문항**은 단일 세부과목 중 배분이 가장 크다. 가치평가·재무제표 해석을 먼저 잡고 기술적·산업분석을 빠뜨리지 않는다. | 2권 PART 03 Chapter 02 SECTION 01–06(가치평가), Chapter 03 SECTION 01–10(재무 분석); PART 04 Chapter 02 SECTION 01–08(추세), PART 05 Chapter 01 SECTION 01–03(산업분석 개관) | 문항 배분 높음; 절 선택은 추론 |
| A | **법규 11문항**(자본시장 관련 7 + 금융위원회 규정 4)은 범위가 넓다. 펀드·자산운용 관련 규제를 반복한다는 교육업체 조언이 있다. | 3권 PART 02 Chapter 03 SECTION 01–05(업자 규제), Chapter 05 SECTION 01(집합투자업), Chapter 11 SECTION 01–06 및 Chapter 12 SECTION 01–08(집합투자기구) | 문항 배분 높음; 특정 장 빈도 미확인 |
| A | **주식·채권·파생상품 운용 18문항**(각 6문항). 주식은 난도 대비 반복, 채권은 계산과 개념을 함께 연습한다. | 4권 PART 01 Chapter 03 SECTION 01–05(전략적 배분), Chapter 06 SECTION 01–07(주식 운용); PART 02 Chapter 02 SECTION 01–04(채권가격·수익률), Chapter 03 SECTION 01–03(듀레이션·볼록성); PART 03 Chapter 02 SECTION 01–03(선도·선물), Chapter 07 SECTION 01–06(옵션가격) | 묶음 문항 배분 높음; 절 선택은 추론 |
| A | **리스크관리 8문항**. VaR 개념·측정·한계와 계산을 연결한다는 교육업체 조언이 있다. | 2권 PART 06 Chapter 02 SECTION 01–04(시장위험·VaR), Chapter 03 SECTION 01–04(신용위험) | 문항 배분과 정성 조언 일치 |
| A | **금융상품 8문항, 부동산 관련 5문항**. 금융투자상품과 부동산 기초에 집중하라는 교육업체 조언이 있다. | 1권 PART 06 Chapter 02 SECTION 01–05(펀드), PART 10 Chapter 01 SECTION 01–03(부동산 기초), PART 11 Chapter 02 SECTION 01–06(부동산 펀드) | 세부과목 배분 확인; 장별 비율 미확인 |
| B | **세제 7문항**. 과목 1의 과락 방지를 위해 기본 구조를 확인한다. | 1권 PART 01 Chapter 01 SECTION 01–06, Chapter 02 SECTION 01–07, Chapter 03 SECTION 01–04 | 우선순위는 추론 |
| B | **대안·해외투자 각 5문항**. 대안투자는 PEF·헤지펀드·신용파생을 다루되 특정 절만으로 5문항을 가정하지 않는다. | 2권 PART 01 Chapter 03 SECTION 01–03, Chapter 04 SECTION 01–07, Chapter 06 SECTION 01–03; PART 02 Chapter 03 SECTION 01–03 | 정성 조언; 절별 빈도 미확인 |
| B | **직무윤리 5문항**은 교육업체가 비교적 점수를 확보하기 좋은 영역으로 본다. | 3권 PART 01 Chapter 02 SECTION 01–04 | 정성 조언 |
| B | **분산투자 5문항·거시경제 4문항**. 분산투자는 계산, 거시는 모형과 경제지표를 연습한다. | 5권 PART 02 Chapter 02 SECTION 01–06(수익·위험), Chapter 03 SECTION 01–03(CAPM); PART 01 Chapter 01 SECTION 01–07(IS-LM), Chapter 04 SECTION 01–04(경기지표) | 문항 배분 확인; 절 선택은 추론 |
| B | **투자운용 결과분석 4문항**. 위험조정 성과지표의 계산·해석을 확인한다. | 4권 PART 04 Chapter 02 SECTION 01–03(수익률·위험), Chapter 04 SECTION 01–07(위험조정 성과) | 정성 조언; 절별 빈도 미확인 |

3과목은 총 50문항으로 가장 크지만 범위가 넓다. 1·2과목도 각각 **8/20, 12/30**의 과락선이 있으므로 B 범위를 생략하지 않는다. 위 표에 없는 SECTION은 **낮은 출제빈도가 확인된 구간이 아니라 아직 우선순위를 지정하지 않은 구간**이다. 특히 3권 PART 04 금융소비자 보호법과 PART 03 협회 규정은 공식 세부과목 경계·문항 매핑을 확인하기 전까지 제외하거나 감점해서는 안 된다. 학습자는 모의고사 오답이 몰린 세부과목을 우선순위보다 앞에 둔다.

정확도를 높일 다음 자료는 최신 회차의 공식 과목표, 2026년 표준교재 개정내역, 검증 가능한 회차별 문항 분류다. 이 자료로 절별 관측 빈도가 생기면 잠정 우선순위와 별도 열에 표본 회차·분모·분류법을 표시하고 다시 평가한다.

## D1 관계형 데이터 모델

SQLite 기반 Cloudflare D1을 가정한 논리 모델이다. SQL, 마이그레이션, D1 리소스는 이번 단계에서 만들지 않는다.

| 테이블 | 주요 열 및 키 | 역할 |
| --- | --- | --- |
| `editions` | `id` PK, `exam_code`, `year`, `publisher`, `verified_at` | 판본 단위 고정 |
| `books` | `id` PK, `edition_id` FK, `volume_no`, `isbn13` UNIQUE, `source_id` FK | 1~5권; 판본 내 권 번호 UNIQUE |
| `parts` | `id` PK, `book_id` FK, `ordinal`, `title`, `start_page` | 권별 PART 순서 |
| `chapters` | `id` PK, `part_id` FK, `ordinal`, `title`, `start_page` | PART별 Chapter 순서 |
| `sections` | `id` PK, `chapter_id` FK, `ordinal`, `title`, `start_page` | Chapter별 SECTION 순서 |
| `exam_blueprints` | `id` PK, `exam_code`, `effective_from`, `source_id` FK, `verification_status` | 적용 시점별 출제기준 |
| `exam_subjects` | `id` PK, `blueprint_id` FK, `ordinal`, `question_count`, `minimum_correct` | 과목별 문항·과락 |
| `exam_topics` | `id` PK, `subject_id` FK, `ordinal`, `title`, `question_count` | 세부과목별 배분 |
| `topic_chapters` | `topic_id` FK, `chapter_id` FK, `source_id` FK, `mapping_status`, 복합 PK | 세부과목↔교재 Chapter 다대다 연결. 세밀한 매핑이 필요하면 SECTION 연결 테이블을 추가 |
| `sources` | `id` PK, `url`, `publisher`, `source_type`, `checked_at`, `notes` | 출처와 확인 이력 |
| `exam_rounds` | `id` PK, `round_no`, `exam_date`, `blueprint_id` FK | 회차별 관측 자료의 기준 |
| `observed_items` | `id` PK, `round_id` FK, `source_id` FK, `source_item_key`, `evidence_type`, `review_status` | 확인 가능한 기출·복원 문항의 식별 정보. 원문은 기본 저장 대상이 아님 |
| `observed_item_sections` | `item_id` FK, `section_id` FK, `reviewer`, `confidence`, 복합 PK | 한 문항의 복수 SECTION 태그 |
| `frequency_reports` | `id` PK, `source_id` FK, `topic_id`/`section_id` FK, `observed_count`, `method`, `round_range`, `sample_size`, `notes` | 외부 분석의 집계값과 방법을 별도 보관; 초기에는 비움 |
| `study_priority_assessments` | `id` PK, `section_id` FK, `priority_level`, `basis`, `source_id` FK, `assessed_at`, `status` | 잠정 학습 조언을 출제빈도와 분리해 버전 관리; 실제 구현 여부는 재확인 때 결정 |

각 계층은 `(부모_id, ordinal)`을 UNIQUE로 두고 외래 키를 켠다. 제목이 같아도 다른 권·판본을 합치지 않는다. 페이지는 목차 기준 시작 쪽수이며 미확인일 때 NULL로 둔다. 문항 배분 합계는 과목별·전체 합계와 맞춰 검증한다. 검색용 인덱스는 `isbn13`, 부모별 순서, 출제기준 적용 시점, 매핑의 양쪽 FK부터 설계한다. 표준교재의 목차와 시험 출제기준은 각각 다른 시점에 바뀔 수 있으므로 독립적으로 버전 관리한다.

### 관계와 조회 시나리오

`edition → book → part → chapter → section`은 1:N이다. `blueprint → subject → topic`도 1:N이고, `topic ↔ chapter`는 N:M이다. 사용자는 “2권 PART 03의 장·절”을 순서대로 조회하거나 “투자분석기법 12문항에 관련된 교재 장”을 찾아볼 수 있다. 빈도는 관측 자료가 들어오기 전까지 NULL/미확인으로 표시한다. 출제 비중을 각 장에 문항 수로 균등 분배하지 않는다.

## 구현 전 검증 순서

1. 5권의 공개 목차를 ISBN 기준으로 다시 대조하여 SECTION 제목, 시작 쪽수, 번호 누락, SECTION 없는 장을 확정한다.
2. 금융투자협회 공식 시험개요의 최신 과목표 또는 해당 회차 시행공고로 문항 배분을 직접 검증하고, 현재의 검증 대기 표시를 해제한다.
3. 교재 장과 세부과목의 대응표를 출처와 함께 검토한다. 금융소비자 보호법 등 애매한 범위는 미매핑으로 유지한다.
4. D1 제약·인덱스·마이그레이션과 시드의 재실행 정책을 설계하고, 개발 환경에서 합계·계층·판본 보존을 확인한다.
5. **사용자에게 한 번 다시 확인받은 후** 구현 범위에 맞춰 D1 생성, Worker 바인딩, 마이그레이션, API, 화면을 진행한다. 배포와 Git 커밋은 별도의 명시적 요청이 있을 때만 한다.
