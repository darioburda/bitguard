# BitGuard Web

**BitGuard** es una aplicación web desarrollada con **Vue.js** y **Supabase** que brinda una solución integral de gestión IT para PyMEs. Permite administrar usuarios, equipos, configuraciones técnicas y brindar soporte remoto a través de un **chat interno en tiempo real**.

---

## ✨ Características principales

- ✅ Autenticación y perfiles con Supabase Auth y Storage  
- ✅ Gestión de usuarios con edición, eliminación, filtros y paginación  
- ✅ Gestión de empresas con asignación de planes y validaciones específicas  
- ✅ Validaciones detalladas en formularios (nombre obligatorio, email válido, formato de CUIT)  
- ✅ Campos técnicos personalizables por usuario (equipo, IP, RAM, SO, microprocesador, etc.)  
- ✅ Control de visitas y horas consumidas por empresa  
- ✅ Visualización gráfica del consumo de soporte con vue-chartjs  
- ✅ Chat global y privado en tiempo real  
- ✅ Publicaciones con imágenes y comentarios  
- ✅ Vista responsive adaptada a mobile y desktop  
- ✅ Vista personalizada para usuarios no admin con datos de su empresa, compañeros y tickets propios  
- ✅ Feedback visual con SweetAlert2 y componente AlertMessage  
- ✅ Validaciones al editar tickets (estado, técnico asignado, minutos usados)  
- ✅ Visualización del plan de empresa en cada card de usuario (BadgePlan)  
- ✅ Eliminación del campo bio; se muestra interno_telefono como **no editable**  
- ✅ En MyProfile.vue ya no se permite enlazar a RustDesk directamente, solo visible en ABM por admins  

---

## 🧱 Tecnologías utilizadas

| Categoría         | Herramientas                                                              |
|-------------------|---------------------------------------------------------------------------|
| **Frontend**      | Vue 3 + Vite + TailwindCSS                                                |
| **Backend**       | Supabase (Auth, Database, Storage, Edge Functions)                        |
| **Base de datos** | PostgreSQL (gestionado desde Supabase)                                    |
| **Realtime**      | Supabase Realtime Channels                                                |
| **Storage**       | Supabase Buckets (profile-picture, post-image)                        |
| **Estilo**        | Tailwind + clases personalizadas                                          |
| **Gráficos**      | vue-chartjs + chart.js                                                    |
| **Animaciones**   | SweetAlert2, animaciones CSS (spin, fade-in, hover, etc.)           |

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
│ ├── pedidos/ # Vista de pedidos por rol (admin, vendedor)
│ └── tickets/ # ABM de soporte técnico
├── services/ # Conexión con Supabase (auth, publicaciones, empresas, etc.)
├── styles/ # SCSS global, variables y animaciones
└── router/ # Definición de rutas con protección por rol

markdown
Copiar
Editar

---

## 🔐 Seguridad y control de acceso

- Rutas protegidas según el estado de sesión y el rol (is_admin)  
- Vistas administrativas accesibles solo para usuarios con permisos (abm-usuarios, abm-empresas, abm-tickets)  
- Las rutas sensibles se verifican en tiempo real mediante subscribeToAuthState  

---

## 🧩 Gestión de empresas y planes

- Las empresas tienen los campos:  
  - nombre, email_contacto, telefono, direccion, cuit, plan_id  
  - visitas_consumidas, horas_consumidas, updated_at

- Validaciones:
  - Nombre obligatorio  
  - Email con formato válido  
  - CUIT con formato XX-XXXXXXXX-X  
  - Plan obligatorio

- Visualización con gráfica de torta (vue-chartjs) que muestra:
  - Horas y visitas consumidas  
  - Porcentaje restante  
  - Tiempo total incluido por plan  

---

## 🆘 Gestión de tickets de soporte

- ABM completo de tickets: listado, creación, edición y eliminación  
- Cada ticket registra:
  - Empresa solicitante  
  - Usuario que solicita soporte  
  - Técnico asignado (opcional al inicio)  
  - Tipo (Remoto o Presencial)  
  - Minutos utilizados  
  - fue_visita (booleano)  
  - Estado: abierto, en_proceso, cerrado  
  - Fecha de creación y actualización  

### 🔎 Validaciones al editar tickets

- tecnico_id obligatorio si el estado es en_proceso o cerrado  
- minutos_usados obligatorio si el estado es cerrado  
- Al guardar, se actualiza el campo actualizado  

---

## 👤 Vista para usuarios no administradores

- MyProfile.vue: muestra solo la información del usuario logueado  
  - Nombre, email, equipo, IP, SO, memoria, etc.  
  - Campo interno_telefono visible y no editable  
  - Badge del Plan de su empresa  
  - Ya **no** se muestra el enlace a RustDesk  

- ContactosEmpresa.vue: lista de compañeros de su misma empresa  
  - Foto, nombre, email, sector e interno  

---

## 🔭 Próximas funcionalidades

- 🔧 Separación de equipos IT como entidad independiente del usuario  
- ⏳ Planes de soporte por horas con contador regresivo y control automático  
- 💬 Comentarios técnicos por ticket en tabla ticket_comentarios  
- 📥 Subida de documentos técnicos a Supabase Storage  
- 📍 Asignación de vendedores y locales en pedidos  
- ⏱ Registro automático de sesiones remotas (futura integración con RustDesk)  

---

## ⚙️ Scripts útiles

bash
# Clonar el proyecto y correr localmente
git clone https://github.com/tu-usuario/bitguard.git
cd bitguard
npm install
npm run dev
👥 Autores
Desarrollado por:

Darío Burda

Nicolás Burda