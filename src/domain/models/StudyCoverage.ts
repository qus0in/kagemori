import type { ExamBlueprint } from './CatalogTypes.ts'

export interface CoverageResult {
  questionId: string
  topicId: string
  isCorrect: boolean
  hintUsed: boolean
}

export type CoverageStatus = 'empty' | 'review' | 'filled'

export interface TopicCoverage {
  id: string
  title: string
  status: CoverageStatus
  answered: number
  independentCorrect: number
}

export function summarizeCoverage(blueprint: ExamBlueprint, results: readonly CoverageResult[]) {
  // Repeated questions contribute only their latest result.
  const latest = [...new Map(results.map((result) => [result.questionId, result])).values()]
  const subjects = blueprint.subjects.map((subject) => ({
    id: subject.id,
    title: subject.title,
    topics: subject.topics.map((topic): TopicCoverage => {
      const answers = latest.filter((result) => result.topicId === topic.id)
      const independentCorrect = answers.filter((result) => result.isCorrect && !result.hintUsed).length
      return {
        id: topic.id, title: topic.title, answered: answers.length, independentCorrect,
        status: independentCorrect > 0 ? 'filled' : answers.length > 0 ? 'review' : 'empty',
      }
    }),
  }))
  const topics = subjects.flatMap((subject) => subject.topics)
  const filled = topics.filter((topic) => topic.status === 'filled').length
  const review = topics.filter((topic) => topic.status === 'review').length
  const percent = topics.length ? Math.round(filled / topics.length * 1000) / 10 : 0
  return { subjects, total: topics.length, filled, review, percent, remainingPercent: (1000 - percent * 10) / 10 }
}
