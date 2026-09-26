// src/ui/pages/StudyPage.tsx
import { useStudySession } from '../hooks/useStudySession.ts'
import { StudyPageHeader } from '../components/study/StudyPageHeader.tsx'
import { StudyModeSelector } from '../components/study/StudyModeSelector.tsx'
import { StudyActiveSection } from '../components/study/StudyActiveSection.tsx'
import { StudyCompleteView } from '../components/study/StudyCompleteView.tsx'
import { StudyCoveragePanel } from '../components/study/StudyCoveragePanel.tsx'

export function StudyPage() {
  const store = useStudySession()

  return (
    <div className="space-y-6">
      <StudyPageHeader
        session={store.session}
        isCompleted={store.isCompleted}
        onReset={store.resetSession}
      />

      {store.error && (
        <div className="alert alert-error text-sm shadow-sm">
          <span>{store.error}</span>
        </div>
      )}

      {!store.session && (
        <StudyModeSelector onStartSession={store.startSession} />
      )}

      <StudyCoveragePanel />

      {store.session && !store.isCompleted && (
        <StudyActiveSection store={store} />
      )}

      {store.isCompleted && (
        <StudyCompleteView
          score={store.score}
          targetCount={store.session?.targetQuestionCount ?? 0}
          onReset={store.resetSession}
        />
      )}
    </div>
  )
}
