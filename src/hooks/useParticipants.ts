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

export function useParticipantByEmail(email: string | null) {
  return useQuery({
    queryKey: ['participant', email],
    enabled: !!email,
    retry: false,
    queryFn: async () => {
      console.log('[useParticipantByEmail] start', { email, url: import.meta.env.VITE_SUPABASE_URL })
      try {
        const fetchPromise = supabase
          .from('participants')
          .select('*')
          .eq('email', email!)
          .maybeSingle()

        const result = await Promise.race([
          fetchPromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 8000)
          ),
        ])

        console.log('[useParticipantByEmail] result', result)
        const { data, error } = result
        if (error) throw error
        return data as Participant | null
      } catch (e) {
        console.error('[useParticipantByEmail] error', e)
        throw e
      }
    },
  })
}

export function useRegisterParticipant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ nombre, email }: { nombre: string; email: string }) => {
      const { data, error } = await supabase
        .from('participants')
        .insert({ nombre, email })
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
