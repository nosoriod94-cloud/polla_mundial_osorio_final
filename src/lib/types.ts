export type ParticipantStatus = 'pending' | 'approved' | 'rejected'
export type PickType = 'local' | 'empate' | 'visitante'

export interface Participant {
  id: string
  nombre: string
  email: string
  status: ParticipantStatus
  registered_at: string
  approved_at: string | null
}

export interface Jornada {
  id: string
  nombre: string
  orden: number
  puntos_acierto: number
  created_at: string
}

export interface Match {
  id: string
  jornada_id: string
  equipo_local: string
  equipo_visitante: string
  fecha_hora: string
  resultado: PickType | null
}

export interface Prediction {
  id: string
  participant_id: string
  match_id: string
  prediccion: PickType
  submitted_at: string
}

export interface Standing {
  participant_id: string
  nombre: string
  email: string
  puntos_totales: number
  aciertos: number
  total_predicciones: number
  updated_at: string
}
