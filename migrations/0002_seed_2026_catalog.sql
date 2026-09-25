-- 0002_seed_2026_catalog.sql
-- 2026년 투자자산운용사 1~5권 목차(28 PART, 125 Chapter) 및 시험 출제기준 시드 데이터

-- Sources
INSERT OR IGNORE INTO sources (id, url, publisher, source_type, checked_at, notes) VALUES
('src-cconma-1', 'https://www.cconma.com/product/PKKOR9788960507845', '금융투자교육원', 'TEXTBOOK_TOC', '2026-09-25', '1권 공개 목차'),
('src-cconma-2', 'https://www.cconma.com/product/PKKOR9788960507852', '금융투자교육원', 'TEXTBOOK_TOC', '2026-09-25', '2권 공개 목차'),
('src-cconma-3', 'https://www.cconma.com/product/PKKOR9788960507869', '금융투자교육원', 'TEXTBOOK_TOC', '2026-09-25', '3권 공개 목차'),
('src-cconma-4', 'https://www.cconma.com/product/PKKOR9788960507876', '금융투자교육원', 'TEXTBOOK_TOC', '2026-09-25', '4권 공개 목차'),
('src-iscream-5', 'https://i-screammall.co.kr/goods/detail/11180175', '금융투자교육원', 'TEXTBOOK_TOC', '2026-09-25', '5권 공개 목차'),
('src-tomatopass', 'https://mobile.tomatopass.com/landing/LicenseInvestment.do', '토마토패스', 'EXAM_BLUEPRINT', '2026-09-25', '2026년 시험 안내 과목 및 문항 배분');

-- Edition
INSERT OR IGNORE INTO editions (id, exam_code, year, publisher, verified_at) VALUES
('edition-2026', 'INVESTMENT_MANAGER', 2026, '금융투자교육원', '2026-09-25');

-- Books (1~5권)
INSERT OR IGNORE INTO books (id, edition_id, volume_no, title, isbn13, source_id) VALUES
('book-1', 'edition-2026', 1, '제1권 금융상품 및 세제', '9788960507845', 'src-cconma-1'),
('book-2', 'edition-2026', 2, '제2권 투자운용 및 전략 Ⅱ 및 투자분석기법', '9788960507852', 'src-cconma-2'),
('book-3', 'edition-2026', 3, '제3권 직무윤리 및 법규', '9788960507869', 'src-cconma-3'),
('book-4', 'edition-2026', 4, '제4권 투자운용 및 전략 Ⅰ', '9788960507876', 'src-cconma-4'),
('book-5', 'edition-2026', 5, '제5권 거시경제 및 분산투자기법', '9788960507883', 'src-iscream-5');

-- 1권 PARTS (12개)
INSERT OR IGNORE INTO parts (id, book_id, ordinal, title) VALUES
('p1-01', 'book-1', 1, 'PART 01 금융투자세제'),
('p1-02', 'book-1', 2, 'PART 02 절세전략'),
('p1-03', 'book-1', 3, 'PART 03 금융상품개론'),
('p1-04', 'book-1', 4, 'PART 04 예금 및 신탁상품'),
('p1-05', 'book-1', 5, 'PART 05 보장성 금융상품'),
('p1-06', 'book-1', 6, 'PART 06 투자성 금융상품'),
('p1-07', 'book-1', 7, 'PART 07 자산유동화 증권의 구조와 사례'),
('p1-08', 'book-1', 8, 'PART 08 주택저당증권'),
('p1-09', 'book-1', 9, 'PART 09 퇴직연금'),
('p1-10', 'book-1', 10, 'PART 10 부동산 개론'),
('p1-11', 'book-1', 11, 'PART 11 부동산 투자 상품의 이해'),
('p1-12', 'book-1', 12, 'PART 12 리츠업무');

-- 1권 CHAPTERS (33개)
INSERT OR IGNORE INTO chapters (id, part_id, ordinal, title, section_range_hint) VALUES
('c1-01-01', 'p1-01', 1, 'Chapter 01 국세기본법', 'SECTION 01–06'),
('c1-01-02', 'p1-01', 2, 'Chapter 02 소득세법', 'SECTION 01–07'),
('c1-01-03', 'p1-01', 3, 'Chapter 03 이자소득, 배당소득 및 양도소득', 'SECTION 01–04'),
('c1-01-04', 'p1-01', 4, 'Chapter 04 증권거래세법', 'SECTION 01–02'),
('c1-01-05', 'p1-01', 5, 'Chapter 05 기타 금융세제', 'SECTION 01–01'),
('c1-02-01', 'p1-02', 1, 'Chapter 01 세무전략 : 금융자산 TAX-PLANNING', 'SECTION 01–07'),
('c1-03-01', 'p1-03', 1, 'Chapter 01 금융회사의 종류', 'SECTION 01–02'),
('c1-03-02', 'p1-03', 2, 'Chapter 02 금융상품의 개요', 'SECTION 01–02'),
('c1-04-01', 'p1-04', 1, 'Chapter 01 예금의 구분', 'SECTION 01–02'),
('c1-04-02', 'p1-04', 2, 'Chapter 02 예금의 종류', 'SECTION 01–03'),
('c1-04-03', 'p1-04', 3, 'Chapter 03 신탁상품의 개념과 특징', 'SECTION 01–02'),
('c1-04-04', 'p1-04', 4, 'Chapter 04 신탁상품의 종류', 'SECTION 01–02'),
('c1-05-01', 'p1-05', 1, 'Chapter 01 생명보험상품', 'SECTION 01–02'),
('c1-05-02', 'p1-05', 2, 'Chapter 02 손해보험상품', 'SECTION 01–02'),
('c1-06-01', 'p1-06', 1, 'Chapter 01 금융투자상품의 개념 및 종류', 'SECTION 01–02'),
('c1-06-02', 'p1-06', 2, 'Chapter 02 펀드상품', 'SECTION 01–05'),
('c1-06-03', 'p1-06', 3, 'Chapter 03 기타 금융투자상품', 'SECTION 01–04'),
('c1-07-01', 'p1-07', 1, 'Chapter 01 자산유동화증권(ABS)의 기본개념', 'SECTION 01–03'),
('c1-07-02', 'p1-07', 2, 'Chapter 02 자산유동화증권의 구조', 'SECTION 01–03'),
('c1-07-03', 'p1-07', 3, 'Chapter 03 자산유동화증권 주요 발행유형', 'SECTION 01–04'),
('c1-08-01', 'p1-08', 1, 'Chapter 01 주택저당증권(MBS)', 'SECTION 01–07'),
('c1-09-01', 'p1-09', 1, 'Chapter 01 퇴직연금제도', 'SECTION 01–06'),
('c1-10-01', 'p1-10', 1, 'Chapter 01 부동산 투자의 기초', 'SECTION 01–03'),
('c1-10-02', 'p1-10', 2, 'Chapter 02 부동산 투자의 이해', 'SECTION 01–02'),
('c1-10-03', 'p1-10', 3, 'Chapter 03 부동산의 이용 및 개발', 'SECTION 01–02'),
('c1-11-01', 'p1-11', 1, 'Chapter 01 부동산 투자 구분', 'SECTION 01–02'),
('c1-11-02', 'p1-11', 2, 'Chapter 02 부동산 펀드의 이해', 'SECTION 01–06'),
('c1-11-03', 'p1-11', 3, 'Chapter 03 부동산 포트폴리오', 'SECTION 01–02'),
('c1-11-04', 'p1-11', 4, 'Chapter 04 부동산 가치평가', 'SECTION 01–03'),
('c1-11-05', 'p1-11', 5, 'Chapter 05 부동산의 투자가치 분석', 'SECTION 01–03'),
('c1-11-06', 'p1-11', 6, 'Chapter 06 부동산 개발사업 사업타당성 평가', 'SECTION 01–02'),
('c1-12-01', 'p1-12', 1, 'Chapter 01 부동산 간접투자제도의 이해', 'SECTION 01–02'),
('c1-12-02', 'p1-12', 2, 'Chapter 02 부동산 투자회사법의 이해', 'SECTION 01–02');

-- 2권 PARTS (6개)
INSERT OR IGNORE INTO parts (id, book_id, ordinal, title) VALUES
('p2-01', 'book-2', 1, 'PART 01 대안투자운용 및 투자전략'),
('p2-02', 'book-2', 2, 'PART 02 해외 증권 투자운용 및 투자전략'),
('p2-03', 'book-2', 3, 'PART 03 투자분석기법 - 기본적 분석'),
('p2-04', 'book-2', 4, 'PART 04 투자분석기법 - 기술적 분석'),
('p2-05', 'book-2', 5, 'PART 05 투자분석기법 - 산업분석'),
('p2-06', 'book-2', 6, 'PART 06 리스크 관리');

-- 2권 CHAPTERS (29개)
INSERT OR IGNORE INTO chapters (id, part_id, ordinal, title, section_range_hint) VALUES
('c2-01-01', 'p2-01', 1, 'Chapter 01 대안투자상품', 'SECTION 01–02'),
('c2-01-02', 'p2-01', 2, 'Chapter 02 부동산 투자', 'SECTION 01–03'),
('c2-01-03', 'p2-01', 3, 'Chapter 03 PEF(Private Equity Fund)', 'SECTION 01–03'),
('c2-01-04', 'p2-01', 4, 'Chapter 04 헤지펀드', 'SECTION 01–07'),
('c2-01-05', 'p2-01', 5, 'Chapter 05 특별자산 펀드', 'SECTION 01–02'),
('c2-01-06', 'p2-01', 6, 'Chapter 06 Credit Structure', 'SECTION 01–03'),
('c2-02-01', 'p2-02', 1, 'Chapter 01 해외 투자에 대한 이론적 접근', 'SECTION 01–02'),
('c2-02-02', 'p2-02', 2, 'Chapter 02 국제 증권시장', 'SECTION 01–02'),
('c2-02-03', 'p2-02', 3, 'Chapter 03 해외 증권투자전략', 'SECTION 01–03'),
('c2-03-01', 'p2-03', 1, 'Chapter 01 증권분석의 개념 및 기본체계', 'SECTION 01–04'),
('c2-03-02', 'p2-03', 2, 'Chapter 02 유가증권의 가치평가', 'SECTION 01–06'),
('c2-03-03', 'p2-03', 3, 'Chapter 03 기업분석(재무제표분석)', 'SECTION 01–10'),
('c2-03-04', 'p2-03', 4, 'Chapter 04 주식투자', 'SECTION 01–04'),
('c2-04-01', 'p2-04', 1, 'Chapter 01 기술적 분석', 'SECTION 01–02'),
('c2-04-02', 'p2-04', 2, 'Chapter 02 추세분석', 'SECTION 01–08'),
('c2-04-03', 'p2-04', 3, 'Chapter 03 패턴 분석', 'SECTION 01–03'),
('c2-04-04', 'p2-04', 4, 'Chapter 04 캔들 차트 분석', 'SECTION 01–02'),
('c2-04-05', 'p2-04', 5, 'Chapter 05 지표 분석', 'SECTION 01–03'),
('c2-04-06', 'p2-04', 6, 'Chapter 06 엘리어트 파동이론', 'SECTION 01–04'),
('c2-05-01', 'p2-05', 1, 'Chapter 01 산업분석 개요', 'SECTION 01–03'),
('c2-05-02', 'p2-05', 2, 'Chapter 02 산업구조 변화 분석', 'SECTION 01–02'),
('c2-05-03', 'p2-05', 3, 'Chapter 03 산업연관분석(Input-Output Analysis)', 'SECTION 01–03'),
('c2-05-04', 'p2-05', 4, 'Chapter 04 라이프사이클 분석(Life Cycle Analysis)', 'SECTION 01–03'),
('c2-05-05', 'p2-05', 5, 'Chapter 05 경기순환 분석(Business Cycle Analysis)', 'SECTION 01–02'),
('c2-05-06', 'p2-05', 6, 'Chapter 06 산업경쟁력 분석', 'SECTION 01–02'),
('c2-05-07', 'p2-05', 7, 'Chapter 07 산업정책 분석', 'SECTION 01–02'),
('c2-06-01', 'p2-06', 1, 'Chapter 01 리스크와 리스크 관리의 필요성', 'SECTION 01–02'),
('c2-06-02', 'p2-06', 2, 'Chapter 02 시장 리스크(Market Risk)의 측정', 'SECTION 01–04'),
('c2-06-03', 'p2-06', 3, 'Chapter 03 신용 리스크(Credit Risk)의 측정', 'SECTION 01–04');

-- 3권 PARTS (4개)
INSERT OR IGNORE INTO parts (id, book_id, ordinal, title) VALUES
('p3-01', 'book-3', 1, 'PART 01 직무윤리'),
('p3-02', 'book-3', 2, 'PART 02 자본시장과 금융투자업에 관한 법률/금융위원회규정'),
('p3-03', 'book-3', 3, 'PART 03 한국금융투자협회 규정'),
('p3-04', 'book-3', 4, 'PART 04 금융소비자 보호법');

-- 3권 CHAPTERS (27개)
INSERT OR IGNORE INTO chapters (id, part_id, ordinal, title, section_range_hint) VALUES
('c3-01-01', 'p3-01', 1, 'Chapter 01 직무윤리 일반', 'SECTION 01–02'),
('c3-01-02', 'p3-01', 2, 'Chapter 02 금융투자업 직무윤리', 'SECTION 01–04'),
('c3-01-03', 'p3-01', 3, 'Chapter 03 직무윤리의 준수절차 및 위반 시의 제재', 'SECTION 01–02'),
('c3-02-01', 'p3-02', 1, 'Chapter 01 총설', 'SECTION 01–03'),
('c3-02-02', 'p3-02', 2, 'Chapter 02 금융투자상품 및 금융투자업', 'SECTION 01–03'),
('c3-02-03', 'p3-02', 3, 'Chapter 03 금융투자업자에 대한 규제 · 감독', 'SECTION 01–05'),
('c3-02-04', 'p3-02', 4, 'Chapter 04 투자매매업자 및 투자중개업자에 대한 영업행위규제', 'SECTION 01–07'),
('c3-02-05', 'p3-02', 5, 'Chapter 05 집합투자업자의 영업행위 규칙', 'SECTION 01–01'),
('c3-02-06', 'p3-02', 6, 'Chapter 06 투자자문업자 및 투자일임업자의 영업행위 규칙', 'SECTION 01–01'),
('c3-02-07', 'p3-02', 7, 'Chapter 07 신탁업자의 영업행위 규칙', 'SECTION 01–02'),
('c3-02-08', 'p3-02', 8, 'Chapter 08 증권 발행시장 공시제도', 'SECTION 01–03'),
('c3-02-09', 'p3-02', 9, 'Chapter 09 증권 유통시장 공시제도', 'SECTION 01–04'),
('c3-02-10', 'p3-02', 10, 'Chapter 10 기업의 인수합병(M&A) 관련 제도', 'SECTION 01–05'),
('c3-02-11', 'p3-02', 11, 'Chapter 11 집합투자기구(총칙)', 'SECTION 01–06'),
('c3-02-12', 'p3-02', 12, 'Chapter 12 집합투자기구의 구성 등', 'SECTION 01–08'),
('c3-02-13', 'p3-02', 13, 'Chapter 13 집합투자기구 관련 금융위원회 규정', 'SECTION 표기 없음'),
('c3-02-14', 'p3-02', 14, 'Chapter 14 장외거래 및 주식 소유제한', 'SECTION 01–03'),
('c3-02-15', 'p3-02', 15, 'Chapter 15 불공정거래행위에 대한 규제', 'SECTION 01–05'),
('c3-02-16', 'p3-02', 16, 'Chapter 16 금융기관 검사 및 제재에 관한 규정', 'SECTION 표기 없음'),
('c3-02-17', 'p3-02', 17, 'Chapter 17 자본시장 조사업무규정', 'SECTION 표기 없음'),
('c3-03-01', 'p3-03', 1, 'Chapter 01 금융투자회사의 영업 및 업무에 관한 규정', 'SECTION 01–14'),
('c3-03-02', 'p3-03', 2, 'Chapter 02 금융투자전문인력과 자격시험에 관한 규정', 'SECTION 01–04'),
('c3-03-03', 'p3-03', 3, 'Chapter 03 증권 인수업무 등에 관한 규정', 'SECTION 01–03'),
('c3-03-04', 'p3-03', 4, 'Chapter 04 금융투자회사의 약관운용에 관한 규정', 'SECTION 표기 없음'),
('c3-04-01', 'p3-04', 1, 'Chapter 01 금융소비자보호법 제정 배경', 'SECTION 01–02'),
('c3-04-02', 'p3-04', 2, 'Chapter 02 금융소비자보호법 개관', 'SECTION 01–07'),
('c3-04-03', 'p3-04', 3, 'Chapter 03 금융소비자보호법 주요내용', 'SECTION 01–06');

-- 4권 PARTS (4개)
INSERT OR IGNORE INTO parts (id, book_id, ordinal, title) VALUES
('p4-01', 'book-4', 1, 'PART 01 주식투자운용 및 투자전략'),
('p4-02', 'book-4', 2, 'PART 02 채권투자운용 및 투자전략'),
('p4-03', 'book-4', 3, 'PART 03 파생상품투자운용 및 투자전략'),
('p4-04', 'book-4', 4, 'PART 04 투자운용 결과분석');

-- 4권 CHAPTERS (26개)
INSERT OR IGNORE INTO chapters (id, part_id, ordinal, title, section_range_hint) VALUES
('c4-01-01', 'p4-01', 1, 'Chapter 01 운용과정과 주식투자', 'SECTION 01–03'),
('c4-01-02', 'p4-01', 2, 'Chapter 02 자산배분 전략의 정의 및 준비사항', 'SECTION 01–04'),
('c4-01-03', 'p4-01', 3, 'Chapter 03 전략적 자산배분', 'SECTION 01–05'),
('c4-01-04', 'p4-01', 4, 'Chapter 04 전술적 자산배분', 'SECTION 01–05'),
('c4-01-05', 'p4-01', 5, 'Chapter 05 보험자산배분', 'SECTION 01–05'),
('c4-01-06', 'p4-01', 6, 'Chapter 06 주식 포트폴리오 운용전략', 'SECTION 01–07'),
('c4-01-07', 'p4-01', 7, 'Chapter 07 주식 포트폴리오 구성의 실제', 'SECTION 01–04'),
('c4-02-01', 'p4-02', 1, 'Chapter 01 채권의 개요와 채권시장', 'SECTION 01–05'),
('c4-02-02', 'p4-02', 2, 'Chapter 02 채권 가격결정과 채권수익률', 'SECTION 01–04'),
('c4-02-03', 'p4-02', 3, 'Chapter 03 듀레이션과 볼록성', 'SECTION 01–03'),
('c4-02-04', 'p4-02', 4, 'Chapter 04 금리체계', 'SECTION 01–03'),
('c4-02-05', 'p4-02', 5, 'Chapter 05 채권운용전략', 'SECTION 01–05'),
('c4-03-01', 'p4-03', 1, 'Chapter 01 파생상품 개요', 'SECTION 01–02'),
('c4-03-02', 'p4-03', 2, 'Chapter 02 선도거래와 선물거래의 기본 메커니즘', 'SECTION 01–03'),
('c4-03-03', 'p4-03', 3, 'Chapter 03 선물 총론', 'SECTION 01–03'),
('c4-03-04', 'p4-03', 4, 'Chapter 04 옵션 기초', 'SECTION 01–03'),
('c4-03-05', 'p4-03', 5, 'Chapter 05 옵션을 이용한 합성전략', 'SECTION 01–05'),
('c4-03-06', 'p4-03', 6, 'Chapter 06 옵션 프리미엄과 풋-콜 패리티', 'SECTION 01–03'),
('c4-03-07', 'p4-03', 7, 'Chapter 07 옵션 가격결정', 'SECTION 01–06'),
('c4-03-08', 'p4-03', 8, 'Chapter 08 옵션 및 옵션 합성 포지션의 분석', 'SECTION 01–02'),
('c4-04-01', 'p4-04', 1, 'Chapter 01 서론', 'SECTION 01–04'),
('c4-04-02', 'p4-04', 2, 'Chapter 02 성과평가 기초사항', 'SECTION 01–03'),
('c4-04-03', 'p4-04', 3, 'Chapter 03 기준 지표', 'SECTION 01–06'),
('c4-04-04', 'p4-04', 4, 'Chapter 04 위험조정 성과지표', 'SECTION 01–07'),
('c4-04-05', 'p4-04', 5, 'Chapter 05 성과 특성 분석', 'SECTION 01–07'),
('c4-04-06', 'p4-04', 6, 'Chapter 06 성과 발표 방법', 'SECTION 01–03');

-- 5권 PARTS (2개)
INSERT OR IGNORE INTO parts (id, book_id, ordinal, title) VALUES
('p5-01', 'book-5', 1, 'PART 01 거시경제분석'),
('p5-02', 'book-5', 2, 'PART 02 분산투자기법');

-- 5권 CHAPTERS (10개)
INSERT OR IGNORE INTO chapters (id, part_id, ordinal, title, section_range_hint) VALUES
('c5-01-01', 'p5-01', 1, 'Chapter 01 경제모형과 경제정책의 분석: IS-LM 모형', 'SECTION 01–07'),
('c5-01-02', 'p5-01', 2, 'Chapter 02 이자율의 결정과 기간구조', 'SECTION 01–04'),
('c5-01-03', 'p5-01', 3, 'Chapter 03 이자율의 변동요인 분석', 'SECTION 01–03'),
('c5-01-04', 'p5-01', 4, 'Chapter 04 경기변동과 경기예측', 'SECTION 01–04'),
('c5-02-01', 'p5-02', 1, 'Chapter 01 포트폴리오 관리의 기본체계', 'SECTION 01–02'),
('c5-02-02', 'p5-02', 2, 'Chapter 02 포트폴리오 관리', 'SECTION 01–06'),
('c5-02-03', 'p5-02', 3, 'Chapter 03 자본자산 가격결정 모형', 'SECTION 01–03'),
('c5-02-04', 'p5-02', 4, 'Chapter 04 단일 지표 모형', 'SECTION 01–04'),
('c5-02-05', 'p5-02', 5, 'Chapter 05 차익거래 가격결정이론', 'SECTION 01–04'),
('c5-02-06', 'p5-02', 6, 'Chapter 06 포트폴리오 투자전략과 투자성과평가', 'SECTION 01–02');

-- Exam Blueprint
INSERT OR IGNORE INTO exam_blueprints (id, exam_code, effective_from, source_id, verification_status) VALUES
('bp-2026', 'INVESTMENT_MANAGER', '2026-01-01', 'src-tomatopass', 'PROVISIONAL');

-- Exam Subjects (3개 과목, 총 100문항, 과락선 각 40%)
INSERT OR IGNORE INTO exam_subjects (id, blueprint_id, ordinal, title, question_count, minimum_correct) VALUES
('subj-1', 'bp-2026', 1, '제1과목 금융상품 및 세제', 20, 8),
('subj-2', 'bp-2026', 2, '제2과목 투자운용 및 전략 Ⅱ · 투자분석', 30, 12),
('subj-3', 'bp-2026', 3, '제3과목 직무윤리 및 법규 · 투자운용 및 전략 Ⅰ 등', 50, 20);

-- Exam Topics (17개 세부과목)
INSERT OR IGNORE INTO exam_topics (id, subject_id, ordinal, title, question_count) VALUES
('topic-1-1', 'subj-1', 1, '세제관련 법규 · 세무전략', 7),
('topic-1-2', 'subj-1', 2, '금융상품', 8),
('topic-1-3', 'subj-1', 3, '부동산관련 상품', 5),
('topic-2-1', 'subj-2', 1, '대안투자', 5),
('topic-2-2', 'subj-2', 2, '해외증권', 5),
('topic-2-3', 'subj-2', 3, '투자분석기법', 12),
('topic-2-4', 'subj-2', 4, '리스크관리', 8),
('topic-3-1', 'subj-3', 1, '직무윤리', 5),
('topic-3-2', 'subj-3', 2, '자본시장법', 7),
('topic-3-3', 'subj-3', 3, '금융위원회 규정', 4),
('topic-3-4', 'subj-3', 4, '금융투자협회 규정', 3),
('topic-3-5', 'subj-3', 5, '주식', 6),
('topic-3-6', 'subj-3', 6, '채권', 6),
('topic-3-7', 'subj-3', 7, '파생상품', 6),
('topic-3-8', 'subj-3', 8, '운용결과분석', 4),
('topic-3-9', 'subj-3', 9, '거시경제', 4),
('topic-3-10', 'subj-3', 10, '분산투자기법', 5);

-- Topic Chapter Mappings (세부과목 ↔ 교재 장 연결)
INSERT OR IGNORE INTO topic_chapters (topic_id, chapter_id, source_id, mapping_status) VALUES
-- 1과목 세제
('topic-1-1', 'c1-01-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-1', 'c1-01-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-1', 'c1-01-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-1', 'c1-01-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-1', 'c1-01-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-1', 'c1-02-01', 'src-tomatopass', 'PROVISIONAL'),
-- 1과목 금융상품
('topic-1-2', 'c1-03-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-03-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-04-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-04-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-04-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-04-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-05-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-05-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-06-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-06-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-06-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-07-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-07-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-07-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-08-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-2', 'c1-09-01', 'src-tomatopass', 'PROVISIONAL'),
-- 1과목 부동산
('topic-1-3', 'c1-10-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-10-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-10-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-11-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-11-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-11-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-11-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-11-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-11-06', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-12-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-1-3', 'c1-12-02', 'src-tomatopass', 'PROVISIONAL'),
-- 2과목 대안투자
('topic-2-1', 'c2-01-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-1', 'c2-01-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-1', 'c2-01-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-1', 'c2-01-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-1', 'c2-01-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-1', 'c2-01-06', 'src-tomatopass', 'PROVISIONAL'),
-- 2과목 해외증권
('topic-2-2', 'c2-02-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-2', 'c2-02-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-2', 'c2-02-03', 'src-tomatopass', 'PROVISIONAL'),
-- 2과목 투자분석기법
('topic-2-3', 'c2-03-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-03-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-03-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-03-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-04-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-04-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-04-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-04-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-04-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-04-06', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-05-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-05-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-05-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-05-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-05-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-05-06', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-3', 'c2-05-07', 'src-tomatopass', 'PROVISIONAL'),
-- 2과목 리스크관리
('topic-2-4', 'c2-06-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-4', 'c2-06-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-2-4', 'c2-06-03', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 직무윤리
('topic-3-1', 'c3-01-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-1', 'c3-01-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-1', 'c3-01-03', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 자본시장법
('topic-3-2', 'c3-02-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-06', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-07', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-08', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-09', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-10', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-11', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-2', 'c3-02-12', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 금융위 규정
('topic-3-3', 'c3-02-13', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-3', 'c3-02-16', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-3', 'c3-02-17', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 협회 규정
('topic-3-4', 'c3-03-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-4', 'c3-03-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-4', 'c3-03-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-4', 'c3-03-04', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 주식운용
('topic-3-5', 'c4-01-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-5', 'c4-01-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-5', 'c4-01-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-5', 'c4-01-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-5', 'c4-01-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-5', 'c4-01-06', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-5', 'c4-01-07', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 채권운용
('topic-3-6', 'c4-02-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-6', 'c4-02-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-6', 'c4-02-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-6', 'c4-02-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-6', 'c4-02-05', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 파생상품운용
('topic-3-7', 'c4-03-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-7', 'c4-03-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-7', 'c4-03-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-7', 'c4-03-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-7', 'c4-03-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-7', 'c4-03-06', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-7', 'c4-03-07', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-7', 'c4-03-08', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 운용결과분석
('topic-3-8', 'c4-04-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-8', 'c4-04-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-8', 'c4-04-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-8', 'c4-04-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-8', 'c4-04-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-8', 'c4-04-06', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 거시경제
('topic-3-9', 'c5-01-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-9', 'c5-01-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-9', 'c5-01-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-9', 'c5-01-04', 'src-tomatopass', 'PROVISIONAL'),
-- 3과목 분산투자기법
('topic-3-10', 'c5-02-01', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-10', 'c5-02-02', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-10', 'c5-02-03', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-10', 'c5-02-04', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-10', 'c5-02-05', 'src-tomatopass', 'PROVISIONAL'),
('topic-3-10', 'c5-02-06', 'src-tomatopass', 'PROVISIONAL');
