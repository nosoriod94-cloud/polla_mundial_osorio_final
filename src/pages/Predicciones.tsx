import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PredictionToggle } from '@/components/predictions/PredictionToggle'
import { useParticipantByEmail } from '@/hooks/useParticipants'
import { useJornadas } from '@/hooks/useJornadas'
import { useMatches } from '@/hooks/useMatches'
import { usePredictionsByParticipant, useUpsertPrediction } from '@/hooks/usePredictions'
import { formatFechaHora, isMatchLocked } from '@/lib/utils'
import type { PickType } from '@/lib/types'

const emailSchema = z.object({ email: z.string().email('Correo inválido') })

export function Predicciones() {
  const [email, setEmail] = useState<string | null>(null)
  const [expandedJornada, setExpandedJornada] = useState<string | null>(null)

  const participantQuery = useParticipantByEmail(email)
  const { data: participant, isLoading: loadingParticipant } = participantQuery
  const { data: jornadas } = useJornadas()
  const { data: matches } = useMatches()
  const { data: myPicks } = usePredictionsByParticipant(participant?.id ?? null)
  const upsert = useUpsertPrediction()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(emailSchema),
  })

  function onEmailSubmit({ email }: { email: string }) {
    setEmail(email.toLowerCase().trim())
  }

  async function handlePick(matchId: string, prediccion: PickType) {
    if (!participant) return
    try {
      await upsert.mutateAsync({ participantId: participant.id, matchId, prediccion })
    } catch {
      toast.error('Error al guardar predicción')
    }
  }

  // Step 1: Email form
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <header className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
        </header>
        <main className="flex-1 flex items-start justify-center px-4 pt-8">
          <div className="w-full max-w-sm space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Predicciones</h1>
              <p className="text-gray-500 mt-1 text-sm">Ingresa tu correo para continuar</p>
            </div>
            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@correo.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message as string}</p>}
              </div>
              <Button type="submit" className="w-full">Continuar</Button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  // Loading
  if (loadingParticipant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2">
        <p className="text-gray-500">Buscando tu perfil...</p>
        <p className="text-xs text-gray-400 font-mono">
          email={email} status={participantQuery.status} fetchStatus={participantQuery.fetchStatus}
        </p>
        {participantQuery.error && (
          <p className="text-xs text-red-500 font-mono max-w-sm text-center break-words">
            {String(participantQuery.error)}
          </p>
        )}
      </div>
    )
  }

  // Not found
  if (!participant) {
    return (
      <StatusScreen
        icon={<XCircle className="h-12 w-12 text-red-400" />}
        title="Correo no encontrado"
        message="No encontramos tu correo en la polla. ¿Ya te inscribiste?"
        action={<Link to="/registro"><Button className="w-full">Inscribirme</Button></Link>}
        onBack={() => setEmail(null)}
      />
    )
  }

  if (participant.status === 'pending') {
    return (
      <StatusScreen
        icon={<div className="text-4xl">⏳</div>}
        title="Inscripción pendiente"
        message="Los administradores aún no han aprobado tu inscripción. Espera un momento."
        onBack={() => setEmail(null)}
      />
    )
  }

  if (participant.status === 'rejected') {
    return (
      <StatusScreen
        icon={<XCircle className="h-12 w-12 text-red-400" />}
        title="Inscripción no aprobada"
        message="Tu inscripción no fue aprobada. Contacta a los administradores."
        onBack={() => setEmail(null)}
      />
    )
  }

  // Approved: show prediction form
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => setEmail(null)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-900">Mis Predicciones</p>
            <p className="text-xs text-gray-500">{participant.nombre}</p>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-3">
        {(jornadas ?? []).map(jornada => {
          const jornadaMatches = (matches ?? []).filter(m => m.jornada_id === jornada.id)
          if (jornadaMatches.length === 0) return null
          const pending = jornadaMatches.filter(m => !myPicks?.[m.id] && !isMatchLocked(m.fecha_hora)).length
          const isOpen = expandedJornada === jornada.id

          return (
            <div key={jornada.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
                onClick={() => setExpandedJornada(isOpen ? null : jornada.id)}
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{jornada.nombre}</p>
                    <p className="text-xs text-gray-500">{jornadaMatches.length} partidos · {jornada.puntos_acierto} pts/acierto</p>
                  </div>
                </div>
                {pending > 0 && (
                  <Badge variant="warning">{pending} pendiente{pending > 1 ? 's' : ''}</Badge>
                )}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {jornadaMatches.map(match => {
                    const locked = isMatchLocked(match.fecha_hora)
                    const pick = myPicks?.[match.id]
                    const correct = match.resultado && pick === match.resultado
                    const wrong = match.resultado && pick && pick !== match.resultado

                    return (
                      <div key={match.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm min-w-0">
                            <p className="font-medium text-gray-900">
                              {match.equipo_local} <span className="text-gray-400 font-normal">vs</span> {match.equipo_visitante}
                            </p>
                            <p className="text-xs text-gray-400">{formatFechaHora(match.fecha_hora)}</p>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-1.5">
                            {locked && !match.resultado && <Lock className="h-3.5 w-3.5 text-gray-400" />}
                            {correct && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {wrong && <XCircle className="h-4 w-4 text-red-400" />}
                            {match.resultado && (
                              <span className="text-xs text-gray-500">
                                Res: {match.resultado === 'local' ? 'Local' : match.resultado === 'empate' ? 'Empate' : 'Visitante'}
                              </span>
                            )}
                          </div>
                        </div>
                        <PredictionToggle
                          value={pick}
                          onChange={v => handlePick(match.id, v)}
                          disabled={locked}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {(jornadas ?? []).length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p>Aún no hay partidos disponibles.</p>
            <p className="text-sm">Vuelve pronto cuando los administradores los configuren.</p>
          </div>
        )}
      </main>
    </div>
  )
}

function StatusScreen({
  icon, title, message, action, onBack
}: {
  icon: React.ReactNode
  title: string
  message: string
  action?: React.ReactNode
  onBack: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <header className="p-4">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-gray-600">
          <ArrowLeft className="h-4 w-4" /> Cambiar correo
        </button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="flex justify-center">{icon}</div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm">{message}</p>
          {action}
          <Link to="/">
            <Button variant="outline" className="w-full mt-2">Volver al inicio</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
