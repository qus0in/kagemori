// src/app/usecases/GetExamBlueprintUseCase.ts
import type { CatalogRepository } from '../../domain/ports/CatalogRepository.ts'
import { CatalogRules } from '../../domain/models/Catalog.ts'
import type { ExamBlueprintDto } from '../dto/CatalogDto.ts'

export class GetExamBlueprintUseCase {
  private readonly catalogRepository: CatalogRepository

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository
  }

  public async execute(): Promise<ExamBlueprintDto> {
    const blueprint = await this.catalogRepository.getExamBlueprint()
    const totalQuestions = CatalogRules.calculateTotalQuestions(blueprint.subjects)

    return {
      id: blueprint.id,
      examCode: blueprint.examCode,
      effectiveFrom: blueprint.effectiveFrom,
      verificationStatus: blueprint.verificationStatus,
      totalQuestions,
      subjects: blueprint.subjects.map((sub) => ({
        id: sub.id,
        ordinal: sub.ordinal,
        title: sub.title,
        questionCount: sub.questionCount,
        minimumCorrect: sub.minimumCorrect,
        topics: sub.topics.map((top) => ({
          id: top.id,
          ordinal: top.ordinal,
          title: top.title,
          questionCount: top.questionCount,
          mappedChapterIds: top.mappedChapterIds ?? [],
        })),
      })),
    }
  }
}
