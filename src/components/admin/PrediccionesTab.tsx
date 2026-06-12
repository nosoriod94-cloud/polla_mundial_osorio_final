import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAllPredictions } from '@/hooks/usePredictions'
import { useJornadas } from '@/hooks/useJornadas'
import { exportToCsv, formatFechaHora } from '@/lib/utils'

export function PrediccionesTab() {
  const { data: predictions, isLoading } = useAllPredictions()
  const { data: jornadas } = useJornadas()
  const [filterJornada, setFilterJornada] = useState<string>('all')

  function pickLabel(prediccion: string, match: any): string {
    if (prediccion === 'empate') return 'Empate'
    if (prediccion === 'local') return match?.equipo_local ?? 'Local'
    if (prediccion === 'visitante') return match?.equipo_visitante ?? 'Visitante'
    return prediccion
  }

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

  function handleExport() {
    exportToCsv(buildRows(filtered), 'predicciones_mundial_2026.csv')
  }

  function handleExportMatch(match: any, preds: typeof filtered) {
    const fecha = match?.fecha_hora ? match.fecha_hora.slice(0, 10) : ''
    const filename = `predicciones_${slugify(match?.equipo_local ?? '')}_vs_${slugify(match?.equipo_visitante ?? '')}_${fecha}.csv`
    exportToCsv(buildRows(preds), filename)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-600">{predictions?.length ?? 0} predicciones en total</p>
        <Button size="sm" variant="outline" onClick={handleExport} disabled={!predictions?.length}>
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
          {groups.map(({ match, matchId, predicciones }) => (
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
                          <Badge variant={p.prediccion === 'local' ? 'success' : p.prediccion === 'empate' ? 'warning' : 'info'}>
                            {pickLabel(p.prediccion, p.matches as any)}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-400 text-xs">{formatFechaHora(p.submitted_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
