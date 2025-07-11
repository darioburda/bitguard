# BitGuard Web

**BitGuard** es una aplicación web desarrollada con **Vue.js** y **Supabase** que brinda una solución integral de gestión IT para PyMEs. Permite administrar usuarios, equipos, configuraciones técnicas, y brindar soporte remoto a través de un **chat interno en tiempo real**.

---

## ✨ Características principales

- ✅ Autenticación y perfiles con Supabase Auth y Storage
- ✅ Gestión de usuarios con edición, eliminación, filtros y paginación
- ✅ Gestión de empresas con asignación de planes y validaciones específicas
- ✅ Validaciones detalladas en formularios (nombre obligatorio, email válido, formato de CUIT)
- ✅ Campos técnicos personalizables por usuario (equipo, IP, RAM, SO, microprocesador, etc.)
- ✅ Control de visitas y horas consumidas por empresa
- ✅ Chat global y privado en tiempo real
- ✅ Publicaciones con imágenes y comentarios
- ✅ Vista responsive adaptada a mobile y desktop
- ✅ Feedback visual con SweetAlert2 y AlertMessage
- ✅ Validaciones al editar tickets (estado, técnico asignado, minutos usados)

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
├── modules/
│ ├── home/ # Vista de bienvenida
│ ├── publicaciones/ # Publicaciones + comentarios + edición
│ ├── usuarios/ # ABM, perfiles, edición y roles
│ ├── empresas/ # ABM y validaciones de empresas
│ └── pedidos/ # Vista de pedidos por rol (admin, vendedor)
├── services/ # Conexión con Supabase (auth, publicaciones, empresas, etc.)
├── styles/ # SCSS global, variables y animaciones
└── router/ # Definición de rutas con protección por rol

markdown
Copiar
Editar

---

## 🔐 Seguridad y control de acceso

- Las rutas están protegidas según el estado de sesión y el rol (`is_admin`)
- Las vistas de administración (`abm-usuarios`, `abm-empresas`, `abm-tickets`) solo son accesibles por administradores
- Las rutas sensibles verifican autenticación en tiempo real con `subscribeToAuthState`

---

## 🧩 Gestión de empresas y planes

- Las empresas tienen campos: `nombre`, `email_contacto`, `telefono`, `direccion`, `cuit`, `plan_id`, `visitas_consumidas`, `horas_consumidas`
- Validaciones específicas:
  - El nombre es obligatorio
  - Si se ingresa un email, debe tener formato válido
  - El CUIT debe tener formato `XX-XXXXXXXX-X`
  - El plan debe seleccionarse obligatoriamente
- Desde el panel de administración se pueden agregar, editar y eliminar empresas
- Se descuenta automáticamente tiempo y visitas desde el plan cuando se resuelven tickets

---

## 🆘 Gestión de tickets de soporte

ABM completo de tickets con listado, creación, edición y eliminación

Cada ticket registra:

- Empresa solicitante
- Usuario que solicita soporte
- Técnico asignado (obligatorio si está en proceso o cerrado)
- Descripción obligatoria
- Tipo de soporte (`Remoto` o `Presencial`)
- Minutos utilizados para resolverlo (`minutos_usados`)
- Indicador `fue_visita` (booleano)
- Estado (`abierto`, `en_proceso`, `cerrado`)
- Fecha de creación y última actualización

### 🔎 Validaciones al editar un ticket:

- Si el ticket se marca como **en proceso** o **cerrado**, debe tener **técnico asignado**
- Si el ticket se marca como **cerrado**, se exige ingresar **minutos utilizados**
- Al guardar, se actualiza automáticamente el campo `actualizado`

---

### 🗨️ [Próxima mejora] Comentarios internos por ticket

Se implementará un sistema de comentarios por cada ticket, donde técnicos podrán:

- Dejar **notas de avance** o aclaraciones en cada edición
- El usuario que creó el ticket podrá ver estas actualizaciones en tiempo real
- Cada comentario quedará guardado con:
  - Autor
  - Fecha
  - Texto del comentario
- Se usará una tabla `ticket_comentarios` para almacenar el historial

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

💬 Sistema de comentarios técnicos por ticket

👥 Autores
Desarrollado por:

Darío Burda

Nicolás Burda