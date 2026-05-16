import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useParticipants, useUpdateParticipantStatus } from '@/hooks/useParticipants'
import { formatFechaHora } from '@/lib/utils'
import type { ParticipantStatus } from '@/lib/types'

const STATUS_CONFIG: Record<ParticipantStatus, { label: string; variant: 'success' | 'warning' | 'destructive' | 'default' }> = {
  approved: { label: 'Aprobado', variant: 'success' },
  pending: { label: 'Pendiente', variant: 'warning' },
  rejected: { label: 'Rechazado', variant: 'destructive' },
}

type Filter = 'all' | ParticipantStatus

export function ParticipantesTab() {
  const [filter, setFilter] = useState<Filter>('all')
  const { data: participants, isLoading } = useParticipants()
  const updateStatus = useUpdateParticipantStatus()

  const filtered = participants?.filter(p => filter === 'all' || p.status === filter) ?? []
  const pendingCount = participants?.filter(p => p.status === 'pending').length ?? 0

  async function handleStatus(id: string, status: ParticipantStatus) {
    try {
      await updateStatus.mutateAsync({ id, status })
      toast.success(status === 'approved' ? 'Participante aprobado' : 'Participante rechazado')
    } catch {
      toast.error('Error al actualizar el estado')
    }
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: `Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { value: 'approved', label: 'Aprobados' },
    { value: 'rejected', label: 'Rechazados' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Users className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-600">{participants?.length ?? 0} inscritos</span>
        {pendingCount > 0 && (
          <Badge variant="warning" className="ml-auto">
            {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No hay participantes</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.nombre}</p>
                <p className="text-sm text-gray-500 truncate">{p.email}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {formatFechaHora(p.registered_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <Badge variant={STATUS_CONFIG[p.status].variant}>
                  {STATUS_CONFIG[p.status].label}
                </Badge>
                {p.status !== 'approved' && (
                  <button
                    onClick={() => handleStatus(p.id, 'approved')}
                    className="text-green-600 hover:text-green-700"
                    title="Aprobar"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}
                {p.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatus(p.id, 'rejected')}
                    className="text-red-500 hover:text-red-600"
                    title="Rechazar"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
