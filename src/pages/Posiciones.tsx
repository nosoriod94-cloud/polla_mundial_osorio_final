import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy } from 'lucide-react'
import { useStandings } from '@/hooks/useStandings'
import type { Standing } from '@/lib/types'

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM_COLORS = [
  'bg-yellow-50 border-yellow-300',
  'bg-gray-50 border-gray-300',
  'bg-orange-50 border-orange-300',
]

function AccuracyBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-green-500 rounded-full"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  )
}

function PodiumCard({ standing, rank }: { standing: Standing; rank: number }) {
  const accuracy = standing.total_predicciones > 0
    ? Math.round((standing.aciertos / standing.total_predicciones) * 100)
    : 0

  return (
    <div className={`rounded-2xl border-2 p-4 ${PODIUM_COLORS[rank]} text-center`}>
      <p className="text-2xl">{MEDALS[rank]}</p>
      <p className="font-bold text-gray-900 mt-1 text-sm leading-tight">{standing.nombre}</p>
      <p className="text-2xl font-bold text-gray-900 mt-2">{standing.puntos_totales}</p>
      <p className="text-xs text-gray-500">puntos</p>
      <div className="mt-2 space-y-1">
        <p className="text-xs text-gray-600">{standing.aciertos}/{standing.total_predicciones} aciertos</p>
        <AccuracyBar value={accuracy} />
        <p className="text-xs text-gray-400">{accuracy}% precisión</p>
      </div>
    </div>
  )
}

export function Posiciones() {
  const { data: standings, isLoading } = useStandings()

  const top3 = standings?.slice(0, 3) ?? []
  const rest = standings?.slice(3) ?? []

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <header className="p-4 flex items-center gap-3">
        <Link to="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Tabla de Posiciones
          </h1>
          <p className="text-xs text-gray-500">Polla Familia Osorio — Mundial 2026</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-8 space-y-6">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">Cargando posiciones...</div>
        ) : !standings?.length ? (
          <div className="text-center py-16 text-gray-400">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Aún no hay posiciones disponibles.</p>
            <p className="text-sm">Vuelve cuando haya partidos con resultados.</p>
          </div>
        ) : (
          <>
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {top3.map((s, i) => (
                  <PodiumCard key={s.participant_id} standing={s} rank={i} />
                ))}
              </div>
            )}

            {rest.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {rest.map((s, i) => {
                    const rank = i + 4
                    const accuracy = s.total_predicciones > 0
                      ? Math.round((s.aciertos / s.total_predicciones) * 100)
                      : 0
                    return (
                      <div key={s.participant_id} className="flex items-center p-3 gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                          {rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{s.nombre}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <AccuracyBar value={accuracy} />
                            <span className="text-xs text-gray-400 flex-shrink-0">{accuracy}%</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900">{s.puntos_totales}</p>
                          <p className="text-xs text-gray-400">{s.aciertos} ac.</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
