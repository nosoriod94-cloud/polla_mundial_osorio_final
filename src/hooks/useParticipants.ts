import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Participant, ParticipantStatus } from '@/lib/types'

export function useParticipants() {
  return useQuery({
    queryKey: ['participants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('registered_at', { ascending: false })
      if (error) throw error
      return data as Participant[]
    },
  })
}

export function useParticipantByPhone(telefono: string | null) {
  return useQuery({
    queryKey: ['participant', telefono],
    enabled: !!telefono,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('telefono', telefono!)
        .maybeSingle()
      if (error) throw error
      return data as Participant | null
    },
  })
}

export function useRegisterParticipant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ nombre, telefono }: { nombre: string; telefono: string }) => {
      const { data, error } = await supabase
        .from('participants')
        .insert({ nombre, telefono })
        .select()
        .single()
      if (error) throw error
      return data as Participant
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants'] }),
  })
}

export function useUpdateParticipantStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ParticipantStatus }) => {
      const updates: Partial<Participant> = { status }
      if (status === 'approved') updates.approved_at = new Date().toISOString()
      const { error } = await supabase
        .from('participants')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants'] }),
  })
}
