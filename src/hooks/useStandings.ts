import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Standing } from '@/lib/types'

export function useStandings() {
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('standings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'standings_cache' }, () => {
        qc.invalidateQueries({ queryKey: ['standings'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return useQuery({
    queryKey: ['standings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('standings_cache')
        .select('*')
        .order('puntos_totales', { ascending: false })
      if (error) throw error
      return data as Standing[]
    },
    staleTime: 60_000,
  })
}
