# Portafolio Académico — Compiladores

Plataforma web para gestionar evidencias académicas de la materia de **Compiladores**, organizadas por unidades y temas según el temario formal.

## Stack tecnológico

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **UI:** TailwindCSS 4
- **Deploy:** Vercel

## Funcionalidades

- CRUD completo de unidades, temas y evidencias
- Editor de texto enriquecido para apuntes (TipTap)
- Subida de archivos (PDF, imágenes, código) a Supabase Storage
- Sidebar jerárquico con navegación por unidades y temas
- Dashboard con progreso por unidad
- Búsqueda global por contenido
- Etiquetas y fechas de entrega
- Exportación del portafolio a PDF
- Vista previa de PDFs e imágenes
- Tema oscuro/claro

## Configuración local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mtqmjfhxovkosgugppva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Configurar Supabase

En el [Dashboard de Supabase](https://supabase.com/dashboard), ejecuta los scripts SQL en orden:

1. `supabase/migrations/001_initial_schema.sql` — Tablas, RLS y bucket de storage
2. `supabase/migrations/002_seed_compiladores.sql` — Función de seed para Compiladores

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### 5. Primer uso

1. Regístrate con email/contraseña
2. En el dashboard, haz clic en **"Inicializar portafolio de Compiladores"**
3. Se crearán las 6 unidades con sus temas predefinidos

## Estructura del proyecto

```
src/
├── app/                    # Rutas (App Router)
│   ├── dashboard/          # Panel principal
│   ├── login/              # Autenticación
│   └── register/
├── components/
│   ├── dashboard/          # Sidebar, búsqueda, stats
│   ├── evidence/           # Gestión de evidencias
│   ├── editors/            # Editor rich text
│   ├── forms/              # Modales CRUD
│   └── ui/                 # Componentes base
├── lib/
│   ├── supabase/           # Cliente Supabase (browser/server)
│   ├── supabaseClient.ts   # Re-export del cliente
│   ├── services/           # Operaciones CRUD
│   ├── types.ts            # Tipos TypeScript
│   └── utils/              # Helpers y export PDF
└── middleware.ts           # Protección de rutas
```

## Modelo de datos

```
subjects → units → topics → evidences
```

| Tabla | Campos principales |
|-------|-------------------|
| `subjects` | name, description, user_id |
| `units` | title, description, order_index, subject_id |
| `topics` | title, description, unit_id |
| `evidences` | title, type, content, file_url, tags, due_date |

## Deploy en Vercel

1. Conecta el repositorio de GitHub en [vercel.com](https://vercel.com)
2. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático en cada push

## Repositorio

[https://github.com/ton-cast5/PortafolioEvidencias.git](https://github.com/ton-cast5/PortafolioEvidencias.git)

## Unidades del temario

1. Generalidades
2. Análisis Léxico
3. Gramáticas
4. Análisis Sintáctico
5. Fase de Síntesis
6. Tabla de símbolos y memoria
