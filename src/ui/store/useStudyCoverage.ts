import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchStudyCoverage } from '../../infra/api/HttpStudyCoverage.ts'
import { useStudySession } from '../hooks/useStudySession.ts'

// The query cache is temporary; D1 is the only persistent progress store.
export function useStudyCoverage() {
  const feedback = useStudySession((state) => state.feedback)
  const query = useQuery({
    queryKey: ['study', 'coverage'], queryFn: fetchStudyCoverage,
    refetchInterval: 5000, refetchOnWindowFocus: true, retry: 1,
  })
  const { refetch } = query
  useEffect(() => { if (feedback) void refetch() }, [feedback, refetch])
  return query
}
