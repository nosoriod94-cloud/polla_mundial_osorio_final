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
      const { data, error } = await supabase
        .from('predictions')
        .select('*, participants(nombre, telefono), matches(equipo_local, equipo_visitante, fecha_hora, jornadas(nombre, orden))')
        .order('submitted_at', { ascending: true })
      if (error) throw error
      return data
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
