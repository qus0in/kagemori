// src/infra/d1/D1CatalogRepository.ts
import type { BookCatalog, ExamBlueprint } from '../../domain/models/Catalog.ts'
import type { CatalogOverview, CatalogRepository } from '../../domain/ports/CatalogRepository.ts'
import type { D1DatabaseLike } from './D1CatalogTypes.ts'
import { fetchD1Books } from './D1BooksReader.ts'
import { fetchD1Blueprint } from './D1BlueprintReader.ts'
import { fetchD1Overview } from './D1OverviewReader.ts'

export type { D1DatabaseLike }

export class D1CatalogRepository implements CatalogRepository {
  private readonly db?: D1DatabaseLike

  constructor(db?: D1DatabaseLike) {
    this.db = db
  }

  public getOverview(): Promise<CatalogOverview> {
    return fetchD1Overview(this.db)
  }

  public getBooks(): Promise<BookCatalog[]> {
    return fetchD1Books(this.db)
  }

  public async getBookById(id: string): Promise<BookCatalog | null> {
    const books = await this.getBooks()
    return books.find((b) => b.id === id) ?? null
  }

  public getExamBlueprint(): Promise<ExamBlueprint> {
    return fetchD1Blueprint(this.db)
  }
}
