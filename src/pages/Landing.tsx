import { Link } from 'react-router-dom'
import { ClipboardList, Trophy, UserPlus } from 'lucide-react'

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <header className="p-6 text-center">
        <div className="inline-block bg-green-600 text-white px-4 py-1 rounded-full text-xs font-medium mb-4">
          FIFA Mundial 2026 🏆
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Polla Familia Osorio</h1>
        <p className="text-gray-500 mt-2">¿Quién sabe más de fútbol?</p>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-4">
        <Link to="/registro" className="block">
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6 flex items-center gap-4 hover:border-green-500 hover:shadow-md transition-all active:scale-95">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <UserPlus className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Inscribirme</h2>
              <p className="text-sm text-gray-500">Regístrate para participar en la polla</p>
            </div>
          </div>
        </Link>

        <Link to="/predicciones" className="block">
          <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition-all active:scale-95">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <ClipboardList className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mis Predicciones</h2>
              <p className="text-sm text-gray-500">Ingresa tus pronósticos para cada partido</p>
            </div>
          </div>
        </Link>

        <Link to="/posiciones" className="block">
          <div className="bg-white rounded-2xl border-2 border-yellow-200 p-6 flex items-center gap-4 hover:border-yellow-500 hover:shadow-md transition-all active:scale-95">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="h-7 w-7 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Tabla de Posiciones</h2>
              <p className="text-sm text-gray-500">¿Cómo va la competencia?</p>
            </div>
          </div>
        </Link>
      </main>

      <footer className="text-center py-4 text-xs text-gray-400">
        <Link to="/admin/login" className="hover:underline">Admin</Link>
      </footer>
    </div>
  )
}
