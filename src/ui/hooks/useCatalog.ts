// src/ui/hooks/useCatalog.ts
import { useQuery } from '@tanstack/react-query'
import { HttpCatalogRepository } from '../../infra/api/HttpCatalogRepository.ts'
import type { CatalogRepository } from '../../domain/ports/CatalogRepository.ts'

const defaultRepo: CatalogRepository = new HttpCatalogRepository()

export function useCatalogOverview(repo: CatalogRepository = defaultRepo) {
  return useQuery({
    queryKey: ['catalog', 'overview'],
    queryFn: () => repo.getOverview(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCatalogBooks(repo: CatalogRepository = defaultRepo) {
  return useQuery({
    queryKey: ['catalog', 'books'],
    queryFn: () => repo.getBooks(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCatalogBook(bookId: string, repo: CatalogRepository = defaultRepo) {
  return useQuery({
    queryKey: ['catalog', 'book', bookId],
    queryFn: () => repo.getBookById(bookId),
    enabled: Boolean(bookId),
    staleTime: 1000 * 60 * 5,
  })
}

export function useExamBlueprint(repo: CatalogRepository = defaultRepo) {
  return useQuery({
    queryKey: ['catalog', 'blueprint'],
    queryFn: () => repo.getExamBlueprint(),
    staleTime: 1000 * 60 * 5,
  })
}
