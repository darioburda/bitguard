BitGuard Web
BitGuard es una aplicación web desarrollada con Vue.js y Supabase que brinda una solución integral de gestión IT para PyMEs. Permite administrar usuarios, equipos, configuraciones técnicas, y brindar soporte remoto a través de un chat interno.

Características principales
Autenticación y perfiles con Supabase Auth y Storage

Gestión de usuarios con edición, eliminación y asignación de equipos

Chat global y privado en tiempo real

Soporte para imágenes en publicaciones y perfiles

Vista responsive adaptada a mobile y desktop

Tecnologías utilizadas
Categoría	Herramientas
Frontend	Vue 3 + Vite + TailwindCSS
Backend	Supabase (Auth, DB, Storage, Edge Functions)
Base de datos	PostgreSQL (vía Supabase)
Chat Realtime	Supabase Realtime Channels
Storage	Supabase Buckets (profile-picture, post-image)
Estilo	Tailwind + clases personalizadas
Animaciones	SweetAlert2, CSS custom (spin, fade-in)

Estructura del proyecto (parcial)

src/
│
├── assets/               # Imágenes y recursos estáticos
├── components/           # Componentes reutilizables
├── modules/              # Vistas agrupadas por funcionalidad
│   ├── home/             # Vista de inicio con promociones y bienvenida
│   ├── publicaciones/    # Vista de publicaciones y comentarios
│   ├── usuarios/         # ABM de usuarios, perfiles y edición
│   └── pedidos/          # Gestión de pedidos por rol
├── services/             # Servicios conectados a Supabase
└── styles/               # Estilos globales y variables SCSS

Scripts útiles
npm run dev     # Inicia el servidor de desarrollo
Para correr el proyecto localmente, ejecutar npm run dev en la raíz del proyecto.

Próximas funcionalidades:
Separación de equipos IT como entidad independiente

Gestión de tickets e incidentes técnicos

Planes por horas con contador regresivo por usuario