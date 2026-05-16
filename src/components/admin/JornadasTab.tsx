import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useJornadas, useCreateJornada, useUpdateJornada, useDeleteJornada } from '@/hooks/useJornadas'
import type { Jornada } from '@/lib/types'

const schema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  orden: z.coerce.number().int().min(1, 'Orden mínimo 1'),
  puntos_acierto: z.coerce.number().int().min(1, 'Mínimo 1 punto'),
})
type FormData = z.infer<typeof schema>

export function JornadasTab() {
  const { data: jornadas, isLoading } = useJornadas()
  const create = useCreateJornada()
  const update = useUpdateJornada()
  const del = useDeleteJornada()
  const [editing, setEditing] = useState<Jornada | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { nombre: '', orden: (jornadas?.length ?? 0) + 1, puntos_acierto: 3 },
  })

  function startEdit(j: Jornada) {
    setEditing(j)
    setShowForm(true)
    setValue('nombre', j.nombre)
    setValue('orden', j.orden)
    setValue('puntos_acierto', j.puntos_acierto)
  }

  function cancelForm() {
    setEditing(null)
    setShowForm(false)
    reset()
  }

  async function onSubmit(data: FormData) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...data })
        toast.success('Jornada actualizada')
      } else {
        await create.mutateAsync(data)
        toast.success('Jornada creada')
      }
      cancelForm()
    } catch {
      toast.error('Error al guardar la jornada')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta jornada y todos sus partidos?')) return
    try {
      await del.mutateAsync(id)
      toast.success('Jornada eliminada')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{jornadas?.length ?? 0} jornadas configuradas</p>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Nueva Jornada
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3">
          <h3 className="font-medium text-gray-900">{editing ? 'Editar Jornada' : 'Nueva Jornada'}</h3>
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input placeholder="Ej: Fase de Grupos" {...register('nombre')} />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Orden</Label>
              <Input type="number" {...register('orden')} />
              {errors.orden && <p className="text-xs text-red-500">{errors.orden.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Puntos por acierto</Label>
              <Input type="number" {...register('puntos_acierto')} />
              {errors.puntos_acierto && <p className="text-xs text-red-500">{errors.puntos_acierto.message}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={create.isPending || update.isPending}>
              {editing ? 'Guardar cambios' : 'Crear jornada'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={cancelForm}>Cancelar</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : (
        <div className="space-y-2">
          {(jornadas ?? []).map(j => (
            <div key={j.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                  {j.orden}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{j.nombre}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {j.puntos_acierto} pts por acierto
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(j)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(j.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {(jornadas ?? []).length === 0 && (
            <div className="text-center py-8 text-gray-400">No hay jornadas. Crea la primera.</div>
          )}
        </div>
      )}
    </div>
  )
}
