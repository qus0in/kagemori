import type { ExamTopic } from '../../../domain/models/Catalog.ts'

export function CatalogTopicRow({ top, total }: { top: ExamTopic; total: number }) {
  const ratio = Math.round((top.questionCount / total) * 100)
  return (
    <tr className="hover:bg-base-200/40">
      <td className="text-xs font-mono text-base-content/60">{top.ordinal}</td>
      <td className="font-medium text-sm text-base-content/90 break-keep">{top.title}</td>
      <td className="text-right font-bold text-sm text-primary">{top.questionCount}문항</td>
      <td>
        <div className="flex items-center gap-2">
          <progress className="progress progress-primary w-20" value={ratio} max="100"></progress>
          <span className="text-xs text-base-content/60">{ratio}%</span>
        </div>
      </td>
      <td className="text-right text-xs">
        <span className="badge badge-ghost badge-sm font-mono">{top.mappedChapterIds?.length ?? 0}개 장</span>
      </td>
    </tr>
  )
}
