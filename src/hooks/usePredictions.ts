import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Prediction, PickType } from '@/lib/types'

export function usePredictionsByParticipant(participantId: string | null) {
  return useQuery({
    queryKey: ['predictions', participantId],
    enabled: !!participantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('participant_id', participantId!)
      if (error) throw error
      const map: Record<string, PickType> = {}
      for (const p of data as Prediction[]) map[p.match_id] = p.prediccion
      return map
    },
  })
}

export function useAllPredictions() {
  return useQuery({
    queryKey: ['predictions', 'all'],
    queryFn: async () => {
      // Supabase/PostgREST limita cada respuesta a un máximo de filas
      // (1000 por defecto), así que hay que paginar con .range() hasta
      // agotar los resultados, en vez de confiar en una sola consulta.
      const pageSize = 1000
      const allRows: any[] = []
      let from = 0
      while (true) {
        const { data, error } = await supabase
          .from('predictions')
          .select('*, participants(nombre, telefono), matches(equipo_local, equipo_visitante, fecha_hora, jornadas(nombre, orden))')
          .order('submitted_at', { ascending: true })
          .range(from, from + pageSize - 1)
        if (error) throw error
        allRows.push(...data)
        if (data.length < pageSize) break
        from += pageSize
      }
      return allRows
    },
  })
}

export function useUpsertPrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      participantId,
      matchId,
      prediccion,
    }: {
      participantId: string
      matchId: string
      prediccion: PickType
    }) => {
      const { error } = await supabase
        .from('predictions')
        .upsert(
          { participant_id: participantId, match_id: matchId, prediccion, submitted_at: new Date().toISOString() },
          { onConflict: 'participant_id,match_id' }
        )
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions'] })
    },
  })
}
