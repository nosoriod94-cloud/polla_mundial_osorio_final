import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Jornada } from '@/lib/types'

export function useJornadas() {
  return useQuery({
    queryKey: ['jornadas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jornadas')
        .select('*')
        .order('orden', { ascending: true })
      if (error) throw error
      return data as Jornada[]
    },
    staleTime: 60_000,
  })
}

export function useCreateJornada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { nombre: string; orden: number; puntos_acierto: number }) => {
      const { error } = await supabase.from('jornadas').insert(payload)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jornadas'] }),
  })
}

export function useUpdateJornada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; nombre: string; orden: number; puntos_acierto: number }) => {
      const { error } = await supabase.from('jornadas').update(payload).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jornadas'] }),
  })
}

export function useDeleteJornada() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('jornadas').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jornadas'] }),
  })
}
