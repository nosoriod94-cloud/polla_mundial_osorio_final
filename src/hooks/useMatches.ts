import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Match, PickType } from '@/lib/types'

export function useMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('fecha_hora', { ascending: true })
      if (error) throw error
      return data as Match[]
    },
    staleTime: 30_000,
  })
}

export function useCreateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      jornada_id: string
      equipo_local: string
      equipo_visitante: string
      fecha_hora: string
    }) => {
      const { error } = await supabase.from('matches').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export function useUpdateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Match> & { id: string }) => {
      const { error } = await supabase.from('matches').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export function useSetMatchResult() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, resultado }: { id: string; resultado: PickType }) => {
      const { error } = await supabase
        .from('matches')
        .update({ resultado })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['matches'] })
      qc.invalidateQueries({ queryKey: ['standings'] })
    },
  })
}

export function useDeleteMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('matches').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}
