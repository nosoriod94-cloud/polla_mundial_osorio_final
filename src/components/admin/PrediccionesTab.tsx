import { useState } from 'react'
import { Download, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAllPredictions, useUpsertPrediction } from '@/hooks/usePredictions'
import { useJornadas } from '@/hooks/useJornadas'
import { useParticipants } from '@/hooks/useParticipants'
import { exportToCsv, formatFechaHora } from '@/lib/utils'
import type { Participant, PickType } from '@/lib/types'

function pickLabel(prediccion: string, match: any): string {
  if (prediccion === 'empate') return 'Empate'
  if (prediccion === 'local') return match?.equipo_local ?? 'Local'
  if (prediccion === 'visitante') return match?.equipo_visitante ?? 'Visitante'
  return prediccion
}

export function PrediccionesTab() {
  const { data: predictions, isLoading } = useAllPredictions()
  const { data: jornadas } = useJornadas()
  const { data: participants } = useParticipants()
  const [filterJornada, setFilterJornada] = useState<string>('all')
  const approved = (participants ?? []).filter(p => p.status === 'approved')

  const filtered = (predictions ?? []).filter(p => {
    if (filterJornada === 'all') return true
    return String((p.matches as any)?.jornadas?.nombre) === filterJornada
  })

  // Agrupar las predicciones filtradas por partido, ordenadas por fecha_hora
  type Group = { match: any; matchId: string; predicciones: typeof filtered }
  const groupsByMatch = filtered.reduce((acc, p) => {
    const matchId = p.match_id as string
    if (!acc[matchId]) acc[matchId] = { match: p.matches as any, matchId, predicciones: [] }
    acc[matchId].predicciones.push(p)
    return acc
  }, {} as Record<string, Group>)
  const groups = (Object.values(groupsByMatch) as Group[])
    .sort((a, b) => new Date(a.match?.fecha_hora ?? 0).getTime() - new Date(b.match?.fecha_hora ?? 0).getTime())

  function buildRows(preds: typeof filtered) {
    return preds.map(p => ({
      Jornada: (p.matches as any)?.jornadas?.nombre ?? '',
      Local: (p.matches as any)?.equipo_local ?? '',
      Visitante: (p.matches as any)?.equipo_visitante ?? '',
      'Nombre Usuario': (p.participants as any)?.nombre ?? '',
      'Teléfono Usuario': (p.participants as any)?.telefono ?? '',
      Prediccion: pickLabel(p.prediccion, p.matches as any),
      timestamp: p.submitted_at,
    }))
  }

  function slugify(text: string) {
    return text
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  }

  function diaMesSlug(fechaHora: string): string {
    const parts = new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: 'numeric',
      month: 'long',
    }).formatToParts(new Date(fechaHora))
    const day = parts.find(p => p.type === 'day')?.value ?? ''
    const month = parts.find(p => p.type === 'month')?.value ?? ''
    return `${month}${day}`
  }

  function handleExport() {
    exportToCsv(buildRows(filtered), buildExportFilename())
  }

  function buildExportFilename(): string {
    if (filterJornada === 'all') return 'predicciones_mundial_2026.csv'
    const jornada = (jornadas ?? []).find(j => j.nombre === filterJornada)
    const sampleMatch = filtered[0]?.matches as any
    const dia = jornada?.orden ? `dia${jornada.orden}_` : ''
    const mes = sampleMatch?.fecha_hora ? diaMesSlug(sampleMatch.fecha_hora) : ''
    return `predicciones_${dia}${mes}.csv`
  }

  function handleExportMatch(match: any, preds: typeof filtered) {
    const dia = match?.jornadas?.orden ? `dia${match.jornadas.orden}_` : ''
    const mes = match?.fecha_hora ? diaMesSlug(match.fecha_hora) : ''
    const filename = `predicciones_${dia}${mes}_${slugify(match?.equipo_local ?? '')}_vs_${slugify(match?.equipo_visitante ?? '')}.csv`
    exportToCsv(buildRows(preds), filename)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-600">{predictions?.length ?? 0} predicciones en total</p>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={!filtered.length}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterJornada('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterJornada === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Todas
        </button>
        {(jornadas ?? []).map(j => (
          <button
            key={j.id}
            onClick={() => setFilterJornada(j.nombre)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filterJornada === j.nombre ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {j.nombre}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No hay predicciones</div>
      ) : (
        <div className="space-y-4">
          {groups.map(({ match, matchId, predicciones }) => {
            const pendientes = approved.filter(
              p => !predicciones.some(pred => pred.participant_id === p.id)
            )
            return (
              <div key={matchId} className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between gap-2 p-3 bg-gray-50 flex-wrap">
                  <div>
                    <p className="font-medium text-gray-900">
                      {match?.equipo_local} <span className="text-gray-400 font-normal">vs</span> {match?.equipo_visitante}
                    </p>
                    <p className="text-xs text-gray-500">
                      {match?.jornadas?.nombre ?? '-'} · {match?.fecha_hora ? formatFechaHora(match.fecha_hora) : '-'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleExportMatch(match, predicciones)}>
                    <Download className="h-4 w-4" />
                    Descargar CSV
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Participante</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Predicción</th>
                        <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Enviado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {predicciones.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <p className="font-medium text-gray-900">{(p.participants as any)?.nombre}</p>
                            <p className="text-xs text-gray-400">{(p.participants as any)?.telefono}</p>
                          </td>
                          <td className="p-3">
                            <PredictionCell prediction={p} match={p.matches as any} />
                          </td>
                          <td className="p-3 text-gray-400 text-xs">{formatFechaHora(p.submitted_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <AdminPredictionForm match={match} matchId={matchId} pendientes={pendientes} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function AdminPredictionForm({
  match,
  matchId,
  pendientes,
}: {
  match: any
  matchId: string
  pendientes: Participant[]
}) {
  const [participantId, setParticipantId] = useState('')
  const [prediccion, setPrediccion] = useState<PickType | ''>('')
  const upsert = useUpsertPrediction()

  if (pendientes.length === 0) {
    return (
      <p className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
        Todos los participantes aprobados ya predijeron este partido
      </p>
    )
  }

  const picks: { value: PickType; label: string }[] = [
    { value: 'local', label: match?.equipo_local ?? 'Local' },
    { value: 'empate', label: 'Empate' },
    { value: 'visitante', label: match?.equipo_visitante ?? 'Visitante' },
  ]

  async function handleSave() {
    if (!participantId || !prediccion) return
    try {
      await upsert.mutateAsync({ participantId, matchId, prediccion })
      toast.success('Predicción guardada')
      setParticipantId('')
      setPrediccion('')
    } catch {
      toast.error('Error al guardar la predicción')
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 border-t border-gray-100 flex-wrap bg-white">
      <select
        value={participantId}
        onChange={e => setParticipantId(e.target.value)}
        className="text-sm border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 min-w-[200px]"
      >
        <option value="">Agregar predicción para...</option>
        {pendientes.map(p => (
          <option key={p.id} value={p.id}>
            {p.nombre} — {p.telefono}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        {picks.map(pick => (
          <button
            key={pick.value}
            onClick={() => setPrediccion(pick.value)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              prediccion === pick.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {pick.label}
          </button>
        ))}
      </div>
      <Button size="sm" onClick={handleSave} disabled={!participantId || !prediccion || upsert.isPending}>
        Guardar predicción
      </Button>
    </div>
  )
}

function PredictionCell({ prediction, match }: { prediction: any; match: any }) {
  const [editing, setEditing] = useState(false)
  const [prediccion, setPrediccion] = useState<PickType>(prediction.prediccion)
  const upsert = useUpsertPrediction()

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={prediction.prediccion === 'local' ? 'success' : prediction.prediccion === 'empate' ? 'warning' : 'info'}>
          {pickLabel(prediction.prediccion, match)}
        </Badge>
        <button onClick={() => setEditing(true)} className="text-gray-400 hover:text-gray-600" title="Editar predicción">
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  const picks: { value: PickType; label: string }[] = [
    { value: 'local', label: match?.equipo_local ?? 'Local' },
    { value: 'empate', label: 'Empate' },
    { value: 'visitante', label: match?.equipo_visitante ?? 'Visitante' },
  ]

  async function handleSave() {
    try {
      await upsert.mutateAsync({
        participantId: prediction.participant_id,
        matchId: prediction.match_id,
        prediccion,
      })
      toast.success('Predicción actualizada')
      setEditing(false)
    } catch {
      toast.error('Error al actualizar la predicción')
    }
  }

  function handleCancel() {
    setPrediccion(prediction.prediccion)
    setEditing(false)
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {picks.map(pick => (
        <button
          key={pick.value}
          onClick={() => setPrediccion(pick.value)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
            prediccion === pick.value ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {pick.label}
        </button>
      ))}
      <button onClick={handleSave} disabled={upsert.isPending} className="text-green-600 hover:text-green-700" title="Guardar">
        <Check className="h-4 w-4" />
      </button>
      <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600" title="Cancelar">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
