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
      const url = import.meta.env.VITE_SUPABASE_URL as string
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
      console.log('[useParticipantByEmail] start raw fetch', { email, url })
      try {
        const res = await fetch(
          `${url}/rest/v1/participants?select=*&email=eq.${encodeURIComponent(email!)}`,
          {
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
            },
          }
        )
        console.log('[useParticipantByEmail] raw fetch status', res.status)
        const json = await res.json()
        console.log('[useParticipantByEmail] raw fetch json', json)
        if (!res.ok) throw new Error(JSON.stringify(json))
        return (Array.isArray(json) ? json[0] ?? null : json) as Participant | null
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
