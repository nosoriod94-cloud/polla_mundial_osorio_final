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

  const PICK_LABELS: Record<string, string> = {
    local: 'Local',
    empate: 'Empate',
    visitante: 'Visitante',
  }

  const filtered = (predictions ?? []).filter(p => {
    if (filterJornada === 'all') return true
    return String((p.matches as any)?.jornadas?.nombre) === filterJornada
  })

  function handleExport() {
    const rows = (predictions ?? []).map(p => ({
      Jornada: (p.matches as any)?.jornadas?.nombre ?? '',
      Local: (p.matches as any)?.equipo_local ?? '',
      Visitante: (p.matches as any)?.equipo_visitante ?? '',
      'Nombre Usuario': (p.participants as any)?.nombre ?? '',
      'Teléfono Usuario': (p.participants as any)?.telefono ?? '',
      Prediccion: PICK_LABELS[p.prediccion] ?? p.prediccion,
      timestamp: p.submitted_at,
    }))
    exportToCsv(rows, 'predicciones_mundial_2026.csv')
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
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Jornada</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Partido</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Participante</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Predicción</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase">Enviado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-600">{(p.matches as any)?.jornadas?.nombre ?? '-'}</td>
                  <td className="p-3">
                    <span className="font-medium">{(p.matches as any)?.equipo_local}</span>
                    <span className="text-gray-400 mx-1">vs</span>
                    <span className="font-medium">{(p.matches as any)?.equipo_visitante}</span>
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-gray-900">{(p.participants as any)?.nombre}</p>
                    <p className="text-xs text-gray-400">{(p.participants as any)?.telefono}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant={p.prediccion === 'local' ? 'success' : p.prediccion === 'empate' ? 'warning' : 'info'}>
                      {PICK_LABELS[p.prediccion]}
                    </Badge>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">{formatFechaHora(p.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
