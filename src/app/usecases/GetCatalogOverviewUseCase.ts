// src/app/usecases/GetCatalogOverviewUseCase.ts
import type { CatalogRepository } from '../../domain/ports/CatalogRepository.ts'
import type { CatalogOverviewDto } from '../dto/CatalogDto.ts'

export class GetCatalogOverviewUseCase {
  private readonly catalogRepository: CatalogRepository

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository
  }

  public async execute(): Promise<CatalogOverviewDto> {
    const overview = await this.catalogRepository.getOverview()

    return {
      books: overview.books.map((b) => ({
        id: b.id,
        volumeNo: b.volumeNo,
        title: b.title,
        isbn13: b.isbn13,
        partCount: b.partCount,
        chapterCount: b.chapterCount,
      })),
      totalBooks: overview.books.length,
      totalParts: overview.totalParts,
      totalChapters: overview.totalChapters,
      blueprint: {
        examCode: overview.blueprintSummary.examCode,
        totalQuestions: overview.blueprintSummary.totalQuestions,
        subjectsCount: overview.blueprintSummary.subjectsCount,
        topicsCount: overview.blueprintSummary.topicsCount,
      },
    }
  }
}
