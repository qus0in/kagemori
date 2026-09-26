export interface PriorityCardItem {
  title: string
  scopeBadge: string
  desc: string
}

export interface CatalogPriorityCardProps {
  badge: string
  badgeCls: string
  title: string
  titleColorCls: string
  items: readonly PriorityCardItem[]
}

export function CatalogPriorityCard({
  badge,
  badgeCls,
  title,
  titleColorCls,
  items,
}: CatalogPriorityCardProps) {
  return (
    <div className="card bg-base-100 shadow border border-base-300 p-5 min-w-0">
      <div className="flex items-center gap-2 border-b border-base-200 pb-3">
        <span className={`badge font-bold ${badgeCls}`}>{badge}</span>
        <h3 className="font-bold text-base text-base-content">{title}</h3>
      </div>

      <div className="space-y-4 mt-4 text-sm">
        {items.map((item, idx) => (
          <div key={idx} className="p-3 bg-base-200/50 rounded-lg border border-base-200 min-w-0">
            <div className={`flex justify-between items-center font-bold gap-2 ${titleColorCls}`}>
              <span className="break-keep">{item.title}</span>
              <span className={`badge badge-sm shrink-0 ${badgeCls}`}>{item.scopeBadge}</span>
            </div>
            <p className="text-xs text-base-content/80 mt-1 break-keep leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
