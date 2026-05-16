import { Navigate, Link } from 'react-router-dom'
import { LogOut, Users, Calendar, List, BarChart2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ParticipantesTab } from '@/components/admin/ParticipantesTab'
import { JornadasTab } from '@/components/admin/JornadasTab'
import { PartidosTab } from '@/components/admin/PartidosTab'
import { PrediccionesTab } from '@/components/admin/PrediccionesTab'
import { useParticipants } from '@/hooks/useParticipants'
import { useState } from 'react'

type Tab = 'participantes' | 'jornadas' | 'partidos' | 'predicciones'

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'participantes', label: 'Participantes', icon: Users },
  { id: 'jornadas', label: 'Jornadas', icon: Calendar },
  { id: 'partidos', label: 'Partidos', icon: List },
  { id: 'predicciones', label: 'Predicciones', icon: BarChart2 },
]

export function Admin() {
  const { isAdmin, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('participantes')
  const { data: participants } = useParticipants()
  const pendingCount = participants?.filter(p => p.status === 'pending').length ?? 0

  if (loading) return null
  if (!isAdmin) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-900">Panel Admin</h1>
          <p className="text-xs text-gray-500">Polla Familia Osorio</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs text-gray-500 hover:underline">Ver sitio</Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" /> Salir
          </button>
        </div>
      </header>

      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap relative ${
                  isActive
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'participantes' && pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        {activeTab === 'participantes' && <ParticipantesTab />}
        {activeTab === 'jornadas' && <JornadasTab />}
        {activeTab === 'partidos' && <PartidosTab />}
        {activeTab === 'predicciones' && <PrediccionesTab />}
      </main>
    </div>
  )
}
