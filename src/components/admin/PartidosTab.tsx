import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useJornadas } from '@/hooks/useJornadas'
import { useMatches, useCreateMatch, useDeleteMatch, useSetMatchResult } from '@/hooks/useMatches'
import { formatFechaHora } from '@/lib/utils'
import type { PickType } from '@/lib/types'

const matchSchema = z.object({
  equipo_local: z.string().min(1, 'Requerido'),
  equipo_visitante: z.string().min(1, 'Requerido'),
  fecha_hora: z.string().min(1, 'Requerido'),
})
type MatchForm = z.infer<typeof matchSchema>

const RESULT_OPTIONS: { value: PickType; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'empate', label: 'Empate' },
  { value: 'visitante', label: 'Visitante' },
]

export function PartidosTab() {
  const { data: jornadas } = useJornadas()
  const { data: matches } = useMatches()
  const createMatch = useCreateMatch()
  const deleteMatch = useDeleteMatch()
  const setResult = useSetMatchResult()
  const [expandedJornada, setExpandedJornada] = useState<string | null>(null)
  const [addingToJornada, setAddingToJornada] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MatchForm>({
    resolver: zodResolver(matchSchema),
  })

  async function onAddMatch(jornadaId: string, data: MatchForm) {
    try {
      await createMatch.mutateAsync({ jornada_id: jornadaId, ...data })
      toast.success('Partido agregado')
      setAddingToJornada(null)
      reset()
    } catch {
      toast.error('Error al agregar partido')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este partido?')) return
    try {
      await deleteMatch.mutateAsync(id)
      toast.success('Partido eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  async function handleResult(matchId: string, resultado: PickType) {
    try {
      await setResult.mutateAsync({ id: matchId, resultado })
      toast.success('Resultado guardado')
    } catch {
      toast.error('Error al guardar resultado')
    }
  }

  return (
    <div className="space-y-3">
      {!jornadas?.length && (
        <p className="text-center py-8 text-gray-400">Primero crea jornadas en la pestaña Jornadas</p>
      )}
      {(jornadas ?? []).map(jornada => {
        const jornadaMatches = matches?.filter(m => m.jornada_id === jornada.id) ?? []
        const isExpanded = expandedJornada === jornada.id
        const sinResultado = jornadaMatches.filter(m => !m.resultado).length

        return (
          <div key={jornada.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedJornada(isExpanded ? null : jornada.id)}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                <span className="font-medium text-gray-900">{jornada.nombre}</span>
                <Badge variant="default">{jornadaMatches.length} partidos</Badge>
                {sinResultado > 0 && <Badge variant="warning">{sinResultado} sin resultado</Badge>}
              </div>
              <span className="text-xs text-gray-500">{jornada.puntos_acierto} pts/acierto</span>
            </button>

            {isExpanded && (
              <div className="p-3 space-y-2">
                {jornadaMatches.map(match => (
                  <div key={match.id} className="bg-white border border-gray-100 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-medium">{match.equipo_local}</span>
                        <span className="text-gray-400 mx-2">vs</span>
                        <span className="font-medium">{match.equipo_visitante}</span>
                      </div>
                      <button onClick={() => handleDelete(match.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">{formatFechaHora(match.fecha_hora)}</p>

                    {match.resultado ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          Resultado: {RESULT_OPTIONS.find(r => r.value === match.resultado)?.label}
                        </span>
                        <button
                          className="text-xs text-gray-400 hover:text-gray-600 underline ml-auto"
                          onClick={() => {
                            const r = prompt('Cambiar resultado: local, empate, visitante')
                            if (r && ['local', 'empate', 'visitante'].includes(r)) {
                              handleResult(match.id, r as PickType)
                            }
                          }}
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <span className="text-xs text-gray-500 self-center">Resultado:</span>
                        {RESULT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleResult(match.id, opt.value)}
                            className="flex-1 py-1 text-xs rounded border border-gray-200 hover:bg-green-50 hover:border-green-400 hover:text-green-700 transition-colors"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {addingToJornada === jornada.id ? (
                  <form
                    onSubmit={handleSubmit(data => onAddMatch(jornada.id, data))}
                    className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-3 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Local</Label>
                        <Input className="h-8 text-sm" placeholder="Equipo local" {...register('equipo_local')} />
                        {errors.equipo_local && <p className="text-xs text-red-500">{errors.equipo_local.message}</p>}
                      </div>
                      <div>
                        <Label className="text-xs">Visitante</Label>
                        <Input className="h-8 text-sm" placeholder="Equipo visitante" {...register('equipo_visitante')} />
                        {errors.equipo_visitante && <p className="text-xs text-red-500">{errors.equipo_visitante.message}</p>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Fecha y hora</Label>
                      <Input type="datetime-local" className="h-8 text-sm" {...register('fecha_hora')} />
                      {errors.fecha_hora && <p className="text-xs text-red-500">{errors.fecha_hora.message}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={createMatch.isPending}>Agregar</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => { setAddingToJornada(null); reset() }}>Cancelar</Button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingToJornada(jornada.id)}
                    className="w-full py-2 text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:text-green-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Agregar partido
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
