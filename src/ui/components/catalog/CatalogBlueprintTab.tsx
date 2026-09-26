import { DICTIONARY } from '../../constants/dictionary.ts'
import type { ExamBlueprint } from '../../../domain/models/Catalog.ts'
import { CatalogPassingRules } from './CatalogPassingRules.tsx'
import { CatalogSubjectCard } from './CatalogSubjectCard.tsx'

export interface CatalogBlueprintTabProps {
  blueprint: ExamBlueprint | undefined
  isLoading: boolean
  error: unknown
}

export function CatalogBlueprintTab({ blueprint, isLoading, error }: CatalogBlueprintTabProps) {
  const dict = DICTIONARY.catalog
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }
  if (error) {
    return <div className="alert alert-error"><span>{dict.errorBlueprint}</span></div>
  }
  if (!blueprint) return null

  return (
    <div className="space-y-6">
      <CatalogPassingRules />

      <div className="space-y-5">
        {blueprint.subjects.map((sub) => (
          <CatalogSubjectCard key={sub.id} subject={sub} />
        ))}
      </div>
    </div>
  )
}
