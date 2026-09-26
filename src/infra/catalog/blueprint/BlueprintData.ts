import type { ExamBlueprint } from "../../../domain/models/Catalog.ts"
import { subject1 } from "./BlueprintSubject1.ts"
import { subject2 } from "./BlueprintSubject2.ts"
import { subject3 } from "./BlueprintSubject3.ts"

export const STATIC_EXAM_BLUEPRINT: ExamBlueprint = {
  id: "bp-2026",
  examCode: "INVESTMENT_MANAGER",
  effectiveFrom: "2026-01-01",
  verificationStatus: "PROVISIONAL",
  subjects: [subject1, subject2, subject3],
}
