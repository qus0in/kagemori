import type { ExamSubject } from "../../../domain/models/Catalog.ts"
import { s3Topics1to5 } from "./BlueprintSubject3Topics1to5.ts"
import { s3Topics6to10 } from "./BlueprintSubject3Topics6to10.ts"

export const subject3: ExamSubject = {
  id: "subj-3",
  blueprintId: "bp-2026",
  ordinal: 3,
  title: "제3과목 직무윤리 및 법규 · 투자운용 및 전략 Ⅰ 등",
  questionCount: 50,
  minimumCorrect: 20,
  topics: [...s3Topics1to5, ...s3Topics6to10],
}
