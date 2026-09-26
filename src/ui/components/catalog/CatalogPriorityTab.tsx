import { DICTIONARY } from '../../constants/dictionary.ts'
import { CatalogPriorityCard } from './CatalogPriorityCard.tsx'

export function CatalogPriorityTab() {
  const dict = DICTIONARY.catalog

  return (
    <div className="space-y-6">
      <div className="alert alert-warning text-xs leading-relaxed break-keep">
        <div>
          <div className="font-bold text-sm mb-1">{dict.priorityGuide.warningTitle}</div>
          <div>{dict.priorityGuide.warningDesc}</div>
        </div>
      </div>

      <CatalogPriorityCard
        badge={dict.priorityGuide.groupA.badge}
        badgeCls="badge-primary text-white"
        title={dict.priorityGuide.groupA.title}
        titleColorCls="text-primary"
        items={dict.priorityGuide.groupA.items}
      />

      <CatalogPriorityCard
        badge={dict.priorityGuide.groupB.badge}
        badgeCls="badge-secondary text-white"
        title={dict.priorityGuide.groupB.title}
        titleColorCls="text-secondary"
        items={dict.priorityGuide.groupB.items}
      />
    </div>
  )
}
