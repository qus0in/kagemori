// src/infra/study/CatalogTopicContext.ts
import type { CatalogRepository } from '../../domain/ports/CatalogRepository.ts'
import type { ConceptRepository } from '../../domain/ports/ConceptRepository.ts'
import type { TopicContext, TopicContextPort } from '../../domain/ports/QuestionBankPorts.ts'

/** Blueprint weights, mapped textbook chapters and verified concepts per exam topic. */
export class CatalogTopicContext implements TopicContextPort {
  private readonly catalog: CatalogRepository
  private readonly concepts: ConceptRepository

  constructor(catalog: CatalogRepository, concepts: ConceptRepository) {
    this.catalog = catalog
    this.concepts = concepts
  }

  async listTopics(): Promise<TopicContext[]> {
    const [blueprint, books] = await Promise.all([this.catalog.getExamBlueprint(), this.catalog.getBooks()])
    const chapterTitles = new Map(books.flatMap((book) => book.parts.flatMap((part) =>
      part.chapters.map((chapter) => [chapter.id, `${book.title} · ${part.title} · ${chapter.title}`] as const))))
    const topics = blueprint.subjects.flatMap((subject) => subject.topics.map((topic) => ({ subject, topic })))
    return Promise.all(topics.map(async ({ subject, topic }) => ({
      id: topic.id,
      title: topic.title,
      subjectTitle: subject.title,
      weight: topic.questionCount,
      chapters: (topic.mappedChapterIds ?? [])
        .filter((id) => chapterTitles.has(id))
        .map((id) => ({ id, title: chapterTitles.get(id)! })),
      conceptNotes: (await this.concepts.findByTopicId(topic.id))
        .filter((c) => c.status === 'PUBLISHED').map((c) => `${c.title}: ${c.body}`),
    })))
  }
}
