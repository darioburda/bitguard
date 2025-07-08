# BitGuard Web

**BitGuard** es una aplicación web desarrollada con **Vue.js** y **Supabase** que brinda una solución integral de gestión IT para PyMEs. Permite administrar usuarios, equipos, configuraciones técnicas, y brindar soporte remoto a través de un **chat interno en tiempo real**.

---

## ✨ Características principales

- ✅ Autenticación y perfiles con Supabase Auth y Storage
- ✅ Gestión de usuarios con edición, eliminación, filtros y paginación
- ✅ Gestión de empresas con asignación de planes
- ✅ Campos técnicos personalizables por usuario (equipo, IP, RAM, SO, microprocesador, etc.)
- ✅ Control de visitas y horas consumidas por empresa
- ✅ Chat global y privado en tiempo real
- ✅ Publicaciones con imágenes y comentarios
- ✅ Vista responsive adaptada a mobile y desktop
- ✅ Feedback visual con SweetAlert2 y animaciones personalizadas

---

## 🧱 Tecnologías utilizadas

| Categoría         | Herramientas                                                                 |
|-------------------|------------------------------------------------------------------------------|
| **Frontend**      | Vue 3 + Vite + TailwindCSS                                                   |
| **Backend**       | Supabase (Auth, Database, Storage, Edge Functions)                          |
| **Base de datos** | PostgreSQL (gestionado desde Supabase)                                       |
| **Realtime**      | Supabase Realtime Channels                                                   |
| **Storage**       | Supabase Buckets (`profile-picture`, `post-image`)                          |
| **Estilo**        | Tailwind + clases personalizadas                                             |
| **Animaciones**   | SweetAlert2, animaciones CSS (`spin`, `fade-in`, `hover`, etc.)              |

---

## 📁 Estructura del proyecto (parcial)

src/
├── assets/ # Imágenes y recursos estáticos
├── components/ # Componentes reutilizables (botones, alerts, loaders, etc.)
├── pages/ # Vistas principales (Home, Login, ABM, etc.)
├── modules/ # Vistas agrupadas por temática (opcional)
│ ├── home/ # Vista de bienvenida
│ ├── publicaciones/# Publicaciones + comentarios + edición
│ ├── usuarios/ # ABM, perfiles, edición y roles
│ └── pedidos/ # Vista de pedidos por rol (admin, vendedor)
├── services/ # Conexión con Supabase (auth, publicaciones, empresas, etc.)
├── styles/ # SCSS global, variables y animaciones
└── router/ # Definición de rutas con protección por rol

yaml
Copiar
Editar

---

## 🔐 Seguridad y control de acceso

- Las rutas están protegidas según el estado de sesión y el rol (`is_admin`)
- Las vistas de administración (`abm-usuarios`, `abm-empresas`) solo son accesibles por administradores
- Las rutas sensibles verifican autenticación en tiempo real con `subscribeToAuthState`

---

## 🧩 Gestión de empresas y planes

- Las empresas tienen campos: `nombre`, `email_contacto`, `telefono`, `direccion`, `cuit`, `plan_id`, `visitas_consumidas`, `horas_consumidas`
- Desde el panel de administración se pueden agregar, editar y eliminar empresas
- Las empresas están vinculadas a un plan (`plan_id`) que define su soporte contratado
- Se planea usar esta relación para **descontar horas y visitas** automáticamente a través de tickets

---

🆘 Gestión de tickets de soporte
ABM completo de tickets con listado, creación, edición y eliminación

Cada ticket registra:

Empresa solicitante

Usuario que solicita soporte

Técnico asignado (opcional)

Descripción obligatoria

Tipo de soporte (Remoto o Presencial)

Fecha de creación y estado (abierto, cerrado, etc.)

Los tickets se ordenan por fecha y muestran nombres claros (empresa, usuario, técnico)

Validación de campos y selección dinámica de usuarios disponibles

Redirección automática al ABM de tickets tras crear uno nuevo

Preparado para futuras métricas de consumo de soporte (visitas, horas)



---

## ⚙️ Scripts útiles

```bash
# Clonar el proyecto y correr localmente
git clone https://github.com/tu-usuario/bitguard.git
cd bitguard
npm install
npm run dev
🔭 Próximas funcionalidades
🔧 Separación de equipos IT como entidad independiente del usuario

🧰 Gestión de tickets e incidentes técnicos por usuario y empresa

⏳ Planes de soporte por horas con contador regresivo y control automático

⏱ Registro automático de sesiones remotas (integración futura con RustDesk)

📍 Asignación de vendedores y locales en pedidos (etapa 2)

📥 Subida de documentos técnicos a Supabase Storage

👥 Autores
Desarrollado por:

Darío Burda

Nicolás Burda


📐 ¿Cómo sería la estructura básica de una tabla tickets?
id	empresa_id	tipo	descripcion	tecnico	horas_usadas	fue_visita	estado	fecha
uuid	FK a empresa	"remoto"/"on-site"	texto libre	nombre técnico o FK a user	2	true	"cerrado"	timestamp

Y cuando se cierra el ticket, se actualiza automáticamente el contador del plan de la empresa asociada.

