# BitGuard Web

**BitGuard** es una aplicación web desarrollada con **Vue.js** y **Supabase** que brinda una solución integral de gestión IT para PyMEs. Permite administrar usuarios, equipos, configuraciones técnicas y brindar soporte remoto a través de un **chat interno en tiempo real**.

---

## ✨ Características principales

- ✅ Autenticación y perfiles con Supabase Auth y Storage
- ✅ Gestión de usuarios con edición, eliminación y asignación de equipos
- ✅ Chat global y privado en tiempo real
- ✅ Soporte para imágenes en publicaciones y fotos de perfil
- ✅ Vista responsive adaptada a mobile y desktop
- ✅ Feedback visual con SweetAlert2 y animaciones personalizadas

---

## 🧱 Tecnologías utilizadas

| Categoría        | Herramientas                                                                 |
|------------------|------------------------------------------------------------------------------|
| **Frontend**     | Vue 3 + Vite + TailwindCSS                                                   |
| **Backend**      | Supabase (Auth, Database, Storage, Edge Functions)                          |
| **Base de datos**| PostgreSQL (gestionado desde Supabase)                                       |
| **Chat Realtime**| Supabase Realtime Channels                                                   |
| **Storage**      | Supabase Buckets (`profile-picture`, `post-image`)                          |
| **Estilo**       | Tailwind + clases personalizadas                                             |
| **Animaciones**  | SweetAlert2, CSS custom (`spin`, `fade-in`, `hover effects`, etc.)           |

---

## 📁 Estructura del proyecto (parcial)

src/
│
├── assets/ # Imágenes y recursos estáticos
├── components/ # Componentes reutilizables (botones, alerts, etc.)
├── modules/ # Vistas agrupadas por funcionalidad
│ ├── home/ # Vista de inicio con bienvenida y promociones
│ ├── publicaciones/ # Vista de publicaciones + comentarios + imágenes
│ ├── usuarios/ # ABM de usuarios, perfiles y edición
│ └── pedidos/ # Gestión de pedidos según el rol del usuario
├── services/ # Servicios conectados a Supabase (auth, publicaciones, etc.)
└── styles/ # Estilos globales, variables SCSS, animaciones

yaml
Copiar
Editar

---

## ⚙️ Scripts útiles

```bash
npm install        # Instala dependencias
npm run dev        # Inicia el servidor de desarrollo en localhost
Para correr el proyecto localmente:

bash
Copiar
Editar
git clone https://github.com/tu-usuario/bitguard.git
cd bitguard
npm install
npm run dev
🔭 Próximas funcionalidades
🔧 Separación de equipos IT como entidad independiente del usuario

🧰 Gestión de tickets e incidentes técnicos

⏳ Planes de soporte por horas con contador regresivo por usuario

📍 Asignación de vendedores y locales en pedidos (etapa 2)

📥 Subida de documentos técnicos a Supabase Storage

👥 Autores
Desarrollado por:

Darío Burda

Nicolás Burda