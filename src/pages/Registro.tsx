import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRegisterParticipant, useParticipantByEmail } from '@/hooks/useParticipants'

const schema = z.object({
  nombre: z.string().min(2, 'Nombre muy corto').max(80),
  email: z.string().email('Correo inválido'),
})
type FormData = z.infer<typeof schema>

const STATUS_MESSAGES = {
  pending: '⏳ Tu inscripción está pendiente de aprobación. Los administradores la revisarán pronto.',
  approved: '✅ ¡Ya estás aprobado! Puedes ingresar tus predicciones.',
  rejected: '❌ Tu inscripción no fue aprobada. Contacta a los administradores.',
}

export function Registro() {
  const [done, setDone] = useState(false)
  const [checkEmail, setCheckEmail] = useState<string | null>(null)
  const register_ = useRegisterParticipant()
  const { data: existing } = useParticipantByEmail(checkEmail)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setCheckEmail(data.email)
    // Small delay to let the query run
    try {
      await register_.mutateAsync(data)
      setDone(true)
    } catch (err: any) {
      if (err?.code === '23505') {
        // Email ya existe — mostrar su estado
        setCheckEmail(data.email)
      }
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">¡Inscripción enviada!</h2>
            <p className="text-gray-500 mt-2">
              Tu solicitud está pendiente de aprobación. Los administradores te habilitarán pronto.
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="w-full">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (checkEmail && existing && register_.isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Ya estás registrado</h2>
          <p className="text-gray-600">{STATUS_MESSAGES[existing.status]}</p>
          <div className="flex flex-col gap-2">
            {existing.status === 'approved' && (
              <Link to="/predicciones"><Button className="w-full">Ir a predicciones</Button></Link>
            )}
            <Link to="/"><Button variant="outline" className="w-full">Volver al inicio</Button></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pt-8">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inscribirme a la Polla</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Ingresa tus datos. Los administradores aprobarán tu inscripción.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" placeholder="Ej: Juan Osorio" {...register('nombre')} />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" placeholder="tu@correo.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={register_.isPending}>
              {register_.isPending ? 'Enviando...' : 'Enviar inscripción'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
