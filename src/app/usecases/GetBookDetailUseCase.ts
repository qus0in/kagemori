// src/app/usecases/GetBookDetailUseCase.ts
import type { CatalogRepository } from '../../domain/ports/CatalogRepository.ts'
import type { BookDetailDto } from '../dto/CatalogDto.ts'

export class GetBookDetailUseCase {
  private readonly catalogRepository: CatalogRepository

  constructor(catalogRepository: CatalogRepository) {
    this.catalogRepository = catalogRepository
  }

  public async execute(bookId: string): Promise<BookDetailDto | null> {
    const book = await this.catalogRepository.getBookById(bookId)
    if (!book) return null

    return {
      id: book.id,
      volumeNo: book.volumeNo,
      title: book.title,
      isbn13: book.isbn13,
      parts: book.parts.map((part) => ({
        id: part.id,
        ordinal: part.ordinal,
        title: part.title,
        chapters: part.chapters.map((ch) => ({
          id: ch.id,
          ordinal: ch.ordinal,
          title: ch.title,
          sectionRangeHint: ch.sectionRangeHint,
        })),
      })),
    }
  }
}
