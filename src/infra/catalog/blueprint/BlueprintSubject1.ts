import type { ExamSubject } from "../../../domain/models/Catalog.ts"

export const subject1: ExamSubject = {
  "id": "subj-1",
  "blueprintId": "bp-2026",
  "ordinal": 1,
  "title": "제1과목 금융상품 및 세제",
  "questionCount": 20,
  "minimumCorrect": 8,
  "topics": [
    {
      "id": "topic-1-1",
      "subjectId": "subj-1",
      "ordinal": 1,
      "title": "세제관련 법규 · 세무전략",
      "questionCount": 7,
      "mappedChapterIds": [
        "c1-01-01",
        "c1-01-02",
        "c1-01-03",
        "c1-01-04",
        "c1-01-05",
        "c1-02-01"
      ]
    },
    {
      "id": "topic-1-2",
      "subjectId": "subj-1",
      "ordinal": 2,
      "title": "금융상품",
      "questionCount": 8,
      "mappedChapterIds": [
        "c1-03-01",
        "c1-03-02",
        "c1-04-01",
        "c1-04-02",
        "c1-04-03",
        "c1-04-04",
        "c1-05-01",
        "c1-05-02",
        "c1-06-01",
        "c1-06-02",
        "c1-06-03",
        "c1-07-01",
        "c1-07-02",
        "c1-07-03",
        "c1-08-01",
        "c1-09-01"
      ]
    },
    {
      "id": "topic-1-3",
      "subjectId": "subj-1",
      "ordinal": 3,
      "title": "부동산관련 상품",
      "questionCount": 5,
      "mappedChapterIds": [
        "c1-10-01",
        "c1-10-02",
        "c1-10-03",
        "c1-11-01",
        "c1-11-02",
        "c1-11-03",
        "c1-11-04",
        "c1-11-05",
        "c1-11-06",
        "c1-12-01",
        "c1-12-02"
      ]
    }
  ]
}
