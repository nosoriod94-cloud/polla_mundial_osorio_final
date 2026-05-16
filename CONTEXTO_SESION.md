# Contexto de Sesión — Polla Mundial Osorio Final

**Fecha:** 16 de mayo de 2026  
**Proyecto:** `polla_mundial_osorio_final`  
**Objetivo:** Nueva app ligera para la polla de fútbol de la familia Osorio, Mundial 2026

---

## Punto de partida

Se partió del proyecto existente `beta_v2-polla-futbolera-app`, una app multi-tenant compleja con:
- Sistema de licencias, múltiples pollas por usuario
- Auth completa para todos los usuarios (Supabase Auth)
- Invite codes para unirse a pollas
- Super Admin, Client Admin, Polla Admin
- Notificaciones en tiempo real
- 24 migraciones de base de datos

El documento de requerimientos (`# Polla Mundial Osorio Final.md`) definió el alcance reducido para la nueva app.

---

## Decisiones de diseño tomadas en sesión

| Pregunta | Decisión |
|---|---|
| Emails de los 2 admins | Se definen después, en variables de entorno / Supabase Auth dashboard |
| Notificaciones a admins cuando alguien se registra | Solo badge/contador en el dashboard (sin email externo) |
| Bloqueo de predicciones | Automático: 1 hora antes del partido según `fecha_hora` |
| Sistema de puntos | Varía por jornada/fase (cada jornada tiene su propio `puntos_acierto`) |

---

## Arquitectura — Simplificaciones vs. beta_v2

| Característica | beta_v2 | Nueva app |
|---|---|---|
| Auth usuarios regulares | Supabase Auth (email + contraseña) | Solo lookup por email (sin contraseña) |
| Invite codes | Sí | No |
| Licencias / multi-tenancy | Sí | No |
| Pollas múltiples | Sí | Una sola polla fija |
| Roles admin | Super Admin + Client Admin + Polla Admin | 2 admins fijos en tabla `admin_users` |
| Notificaciones | In-app + triggers PostgreSQL | Badge de pendientes en dashboard |
| Bloqueo predicciones | Manual por admin | Automático 1h antes del partido |

---

## Tech Stack

- **Vite 8 + React 18 + TypeScript**
- **Tailwind CSS v3** (v4 estaba instalado por defecto, se bajó a v3 por compatibilidad)
- **shadcn/ui** (componentes manuales: Button, Card, Input, Label, Badge)
- **Supabase JS** (PostgreSQL + Auth solo para admins + Realtime)
- **TanStack React Query v5**
- **React Router v6**
- **React Hook Form + Zod**
- **sonner** (toasts)
- **lucide-react** (iconos)
- **date-fns** (formateo de fechas en español)

---

## Base de Datos — Schema (Supabase)

### Tablas principales

```sql
participants       -- Usuarios regulares (SIN Supabase Auth)
  id, nombre, email, status (pending|approved|rejected), registered_at, approved_at

jornadas           -- Fases del torneo (Grupos, Octavos, etc.)
  id, nombre, orden, puntos_acierto, created_at

matches            -- Partidos individuales
  id, jornada_id, equipo_local, equipo_visitante, fecha_hora, resultado (local|empate|visitante|null)

predictions        -- Predicciones de los participantes
  id, participant_id, match_id, prediccion (local|empate|visitante), submitted_at
  UNIQUE (participant_id, match_id)

standings_cache    -- Tabla de posiciones (actualizada por trigger)
  participant_id, nombre, email, puntos_totales, aciertos, total_predicciones, updated_at

admin_users        -- 2 admins (FK a auth.users de Supabase)
  user_id
```

### Archivos de migración

- `supabase/migrations/001_schema.sql` — Todas las tablas + RLS policies + función `is_admin()`
- `supabase/migrations/002_standings_trigger.sql` — Trigger que recalcula `standings_cache` automáticamente cuando se ingresa un resultado, y trigger para inicializar standings cuando se aprueba un participante

### RLS (Row Level Security)

- `participants`: anon puede INSERT (registro) y SELECT; admin puede todo
- `jornadas` / `matches`: lectura pública, escritura solo admin
- `predictions`: anon puede INSERT/UPDATE (solo si participante está `approved`), admin SELECT ALL
- `standings_cache`: SELECT público para todos (sin auth)
- Admin check: `EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())`

---

## Rutas de la App

| Ruta | Página | Auth |
|---|---|---|
| `/` | Landing — 3 tarjetas de acción | Pública |
| `/registro` | Formulario de inscripción | Pública |
| `/predicciones` | Email → formulario de predicciones | Pública (lookup por email) |
| `/posiciones` | Tabla de posiciones | Pública |
| `/admin/login` | Login de administradores | Pública |
| `/admin` | Panel admin con 4 tabs | Solo admins (Supabase Auth) |

---

## Flujos de Usuario

### Participante regular
1. Entra a `/registro` → ingresa nombre + email → status queda `pending`
2. Admin aprueba desde panel → status pasa a `approved`
3. Entra a `/predicciones` → escribe su email → ve el formulario de predicciones
4. Por cada partido (no bloqueado): selecciona Local / Empate / Visitante → se guarda inmediatamente (upsert)
5. Predicciones se bloquean automáticamente 1h antes del partido
6. Puede ver `/posiciones` en cualquier momento (sin auth)

### Admin
1. Entra a `/admin/login` → Supabase Auth email + contraseña
2. **Tab Participantes**: ve lista con badge de pendientes, aprueba/rechaza
3. **Tab Jornadas**: crea fases (nombre, orden, puntos por acierto)
4. **Tab Partidos**: agrupado por jornada — agrega partidos, ingresa resultados → trigger actualiza standings automáticamente
5. **Tab Predicciones**: ve todas las predicciones, filtra por jornada, exporta CSV

### CSV Export — Columnas exactas
`Jornada, Local, Visitante, Nombre Usuario, Correo Usuario, Prediccion, timestamp`

---

## Estructura de Archivos

```
polla_mundial_osorio_final/
├── src/
│   ├── App.tsx                          # Router + QueryClient + AuthProvider + Toaster
│   ├── main.tsx                         # Entry point
│   ├── index.css                        # Tailwind directives
│   ├── pages/
│   │   ├── Landing.tsx                  # 3 tarjetas: Inscribirse, Predicciones, Posiciones
│   │   ├── Registro.tsx                 # Formulario nombre+email, maneja email duplicado
│   │   ├── Predicciones.tsx             # Paso 1: email | Paso 2: formulario por jornada
│   │   ├── Posiciones.tsx               # Podio top3 + lista, Realtime
│   │   ├── AdminLogin.tsx               # Supabase Auth login, redirect si ya es admin
│   │   └── Admin.tsx                    # Dashboard 4 tabs + badge pendientes
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ParticipantesTab.tsx     # Lista + aprobar/rechazar + filtros
│   │   │   ├── JornadasTab.tsx          # CRUD jornadas con react-hook-form
│   │   │   ├── PartidosTab.tsx          # CRUD partidos + ingresar resultados
│   │   │   └── PrediccionesTab.tsx      # Tabla predicciones + filtro jornada + CSV export
│   │   ├── predictions/
│   │   │   └── PredictionToggle.tsx     # Botones Local | Empate | Visitante
│   │   └── ui/
│   │       ├── button.tsx               # CVA: 6 variantes, 4 tamaños
│   │       ├── card.tsx                 # Card, CardHeader, CardTitle, CardContent, CardFooter
│   │       ├── input.tsx                # Input con focus ring verde
│   │       ├── label.tsx                # Radix Label wrapper
│   │       └── badge.tsx                # CVA: default, success, warning, destructive, info
│   ├── hooks/
│   │   ├── useParticipants.ts           # useParticipants, useParticipantByEmail, useRegisterParticipant, useUpdateParticipantStatus
│   │   ├── useJornadas.ts               # useJornadas, useCreateJornada, useUpdateJornada, useDeleteJornada
│   │   ├── useMatches.ts                # useMatches, useCreateMatch, useUpdateMatch, useSetMatchResult, useDeleteMatch
│   │   ├── usePredictions.ts            # usePredictionsByParticipant, useAllPredictions, useUpsertPrediction
│   │   └── useStandings.ts              # useStandings + Supabase Realtime subscription
│   ├── context/
│   │   └── AuthContext.tsx              # AuthProvider, useAuth — solo para admins
│   └── lib/
│       ├── supabase.ts                  # createClient con VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
│       ├── types.ts                     # Participant, Jornada, Match, Prediction, Standing, PickType
│       └── utils.ts                     # cn(), formatFechaHora(), isMatchLocked(), exportToCsv()
├── supabase/migrations/
│   ├── 001_schema.sql
│   └── 002_standings_trigger.sql
├── .env.example                         # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .gitignore
├── vercel.json                          # SPA fallback: rewrite * → /index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts                       # Plugin react + alias @/ → ./src/
├── tsconfig.app.json
├── package.json
└── index.html                           # lang="es", meta theme-color="#16a34a"
```

---

## Variables de Entorno

Crear archivo `.env` (nunca commitear) con:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

---

## Pasos para Deploy (pendientes)

### 1. Supabase
- [ ] Crear nuevo proyecto en [supabase.com](https://supabase.com)
- [ ] Ir a SQL Editor → correr `001_schema.sql`
- [ ] Ir a SQL Editor → correr `002_standings_trigger.sql`
- [ ] Ir a Authentication → Users → "Add user" (crear los 2 admins con email + contraseña)
- [ ] Copiar el `user_id` de cada admin y correr:
  ```sql
  INSERT INTO admin_users (user_id) VALUES ('uuid-admin-1'), ('uuid-admin-2');
  ```
- [ ] En Table Editor → standings_cache → Replication → habilitar Realtime
- [ ] Copiar la `Project URL` y la `anon public key`

### 2. GitHub
- [ ] Crear nuevo repositorio vacío en GitHub (ej: `polla-mundial-osorio-2026`)
- [ ] Conectar y hacer push:
  ```bash
  git remote add origin https://github.com/tu-usuario/polla-mundial-osorio-2026.git
  git push -u origin main
  ```

### 3. Vercel
- [ ] Ir a [vercel.com](https://vercel.com) → "Add New Project" → importar desde GitHub
- [ ] En "Environment Variables" agregar:
  - `VITE_SUPABASE_URL` = URL del proyecto Supabase
  - `VITE_SUPABASE_ANON_KEY` = anon key
- [ ] Deploy → Vercel asigna URL automáticamente (se puede personalizar)
- [ ] Cada `git push` a `main` desplegará automáticamente

---

## Notas Técnicas Importantes

- **Tailwind v4 fue instalado por defecto** por `create-vite` pero causó error PostCSS. Se bajó a **v3** manualmente con `npm install -D tailwindcss@^3`.
- **`verbatimModuleSyntax`** estaba activado en `tsconfig.app.json` — requiere `import type` para tipos de terceros (corregido en `AuthContext.tsx`).
- **`z.coerce.number()`** con `useForm<FormData>` causa conflicto de tipos en react-hook-form — se resolvió quitando el generic explícito de `useForm` en `JornadasTab.tsx`.
- El alias `@/` → `./src/` está configurado tanto en `vite.config.ts` (para Vite) como en `tsconfig.app.json` `paths` (para TypeScript).
- **Build final**: 50 archivos, 697 KB bundle, 0 errores TypeScript.
