import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Landing } from '@/pages/Landing'
import { Registro } from '@/pages/Registro'
import { Predicciones } from '@/pages/Predicciones'
import { Posiciones } from '@/pages/Posiciones'
import { AdminLogin } from '@/pages/AdminLogin'
import { Admin } from '@/pages/Admin'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/predicciones" element={<Predicciones />} />
            <Route path="/posiciones" element={<Posiciones />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}
