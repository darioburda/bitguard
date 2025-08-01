# BitGuard Web

**BitGuard** es una aplicación web desarrollada con **Vue.js** y **Supabase** que brinda una solución integral de gestión IT para PyMEs. Permite administrar usuarios, equipos, configuraciones técnicas y brindar soporte remoto a través de un chat interno en tiempo real.

---

## ✨ Características principales

- ✅ Autenticación y perfiles con Supabase Auth y Storage  
- ✅ Gestión de usuarios con edición, eliminación, filtros y paginación  
- ✅ Gestión de empresas con asignación de planes y validaciones específicas  
- ✅ Validaciones detalladas en formularios (nombre obligatorio, email válido, formato de CUIT)  
- ✅ Campos técnicos personalizables por usuario (equipo, IP, RAM, SO, microprocesador, etc.)  
- ✅ Control de visitas y horas consumidas por empresa  
- ✅ Visualización gráfica del consumo de soporte con gráficos tipo torta y tooltips personalizados  
- ✅ Seguimiento de minutos consumidos, restantes y excedidos con alertas visuales (color violeta)  
- ✅ Chat global y privado en tiempo real  
- ✅ Publicaciones con imágenes y comentarios  
- ✅ Vista responsive adaptada a mobile y desktop  
- ✅ Vista personalizada para usuarios no admin con datos de su empresa, compañeros y tickets propios  
- ✅ Feedback visual con SweetAlert2 y componente AlertMessage  
- ✅ Validaciones al editar tickets (estado, técnico asignado, minutos usados)  
- ✅ Visualización del plan de empresa en cada card de usuario (BadgePlan)  
- ✅ Eliminación del campo bio; se muestra interno_telefono como no editable  
- ✅ En `MyProfile.vue` ya no se permite enlazar a RustDesk directamente, solo visible en ABM por admins  
- ✅ Nuevo botón "Tomar Ticket" con ícono de mano e integración con modal de confirmación  
- ✅ Estado intermedio `Activo` para tickets tomados por un técnico  
- ✅ Nueva animación fluida al expandir datos técnicos de usuarios  
- ✅ Checkbox fijo visible siempre en cada card de usuario  
- ✅ Modal de eliminación con estética mejorada y comportamiento condicional  
- ✅ Paginación con navegación completa: primero, anterior, siguiente, último  
- ✅ Componente reutilizable `MainButton.vue` con variantes (`agregar`, `editar`, `borrar`, `default`)  
- ✅ Soporte para íconos dinámicos, posición (izquierda/derecha) y texto opcional  
- ✅ Soporte para tamaños (`sm`, `md`, `lg`) y comportamiento responsivo  
- ✅ Vista `Acciones.vue` optimizada con `MainButton`, transiciones, toggle y contador  
- ✅ En mobile, los botones se muestran centrados y con ancho reducido (`w-[80%]`)  
- ✅ Diseño consistente de botones en desktop: íconos alineados, altura y tipografía uniforme  
- ✅ Filtros de usuarios con toggle de detalles integrados en la misma línea que la búsqueda  
- ✅ Grilla de usuarios con `min-h-[600px]` para evitar saltos visuales al no haber resultados  
- ✅ Mensaje de “No se encontraron usuarios…” centrado dentro de la misma grilla  
- ✅ Layout de filtros y resultados mantiene el ancho al aplicar cualquier filtro  

---

## 🧱 Tecnologías utilizadas

| Categoría     | Herramientas                                         |
|---------------|------------------------------------------------------|
| Frontend      | Vue 3 + Vite + TailwindCSS                           |
| Backend       | Supabase (Auth, Database, Storage, Edge Functions)   |
| Base de datos | PostgreSQL (gestionado desde Supabase)               |
| Realtime      | Supabase Realtime Channels                           |
| Storage       | Supabase Buckets (profile-picture, post-image)       |
| Estilo        | Tailwind + clases personalizadas                     |
| Gráficos      | vue-chartjs + chart.js                               |
| Animaciones   | SweetAlert2, `TransitionExpand`, animaciones CSS     |

---

## 📁 Estructura del proyecto (parcial)

```bash
src/
├── assets/                # Imágenes y recursos estáticos
├── components/            # Componentes reutilizables (botones, alerts, loaders, etc.)
│   ├── MainButton.vue     # Botón base reutilizable
│   ├── Acciones.vue       # Acciones globales para ABMs
│   ├── CheckboxSeleccion.vue
│   ├── FiltrosUsuarios.vue
│   └── Paginador.vue
├── pages/                 # Vistas principales (Home, Login, ABM, etc.)
├── modules/
│   ├── home/              # Vista de bienvenida
│   ├── publicaciones/     # Publicaciones + comentarios + edición
│   ├── usuarios/          # ABM, perfiles, edición y roles
│   ├── empresas/          # ABM y validaciones de empresas
│   ├── pedidos/           # Vista de pedidos por rol (admin, vendedor)
│   └── tickets/           # ABM de soporte técnico
├── composables/
│   └── useUsuarios.js     # Lógica de selección, filtros y datos centralizada
├── services/              # Conexión con Supabase (auth, publicaciones, empresas, etc.)
├── styles/                # SCSS global, variables y animaciones
└── router/                # Definición de rutas con protección por rol
🔐 Seguridad y control de acceso
Rutas protegidas según el estado de sesión y el rol (is_admin)

Vistas administrativas accesibles solo para usuarios con permisos (abm-usuarios, abm-empresas, abm-tickets)

Verificación en tiempo real mediante subscribeToAuthState

🧩 Gestión de empresas y planes
Las empresas incluyen los siguientes campos:

nombre, email_contacto, telefono, direccion, cuit, plan_id

visitas_consumidas, minutos_consumidos, minutos_excedidos, updated_at

Validaciones:

Nombre obligatorio

Email con formato válido

CUIT con formato XX-XXXXXXXX-X

Plan obligatorio

Visualización:

Cards con información completa de cada empresa y BadgePlan asignado

Botón para mostrar/ocultar métricas de consumo por empresa

Gráfica tipo torta (vue-chartjs):

Minutos usados, restantes y excedidos (color violeta para excedidos)

Porcentaje restante

Tiempo total incluido por plan

Tooltips personalizados

Diseño visual unificado con MyProfile.vue:

Bloque verde con título "Consumo del Plan" en cada card

Estética consistente con paddings y esquinas redondeadas

Transiciones suaves al alternar visibilidad

Altura mínima dinámica del layout para evitar saltos visuales

🆘 Gestión de tickets de soporte
ABM completo de tickets: listado, creación, edición y eliminación.
Cada ticket registra:

Empresa solicitante

Usuario que solicita soporte

Técnico asignado (opcional al inicio)

Tipo (Remoto o Presencial)

Minutos utilizados

fue_visita (booleano)

Estado: Abierto, Activo, Cerrado

Fecha de creación y actualización

Funcionalidades destacadas:

Botón "Tomar" con ícono de mano (Hand)

Modal de confirmación con título "Confirmar Asignación"

Asignación automática del técnico logueado al tomar el ticket

Actualización del estado del ticket a Activo

Validaciones al editar:

tecnico_id obligatorio si el ticket está activo o cerrado

minutos_usados obligatorio si está cerrado

Actualización automática de updated_at

👤 Vista para usuarios no administradores
MyProfile.vue

Muestra solo los datos del usuario logueado: nombre, email, equipo, IP, SO, memoria, etc.

interno_telefono visible (no editable)

BadgePlan del plan de su empresa

No se muestra enlace a RustDesk

Gráficos de consumo en bloque verde, con toggle para mostrar/ocultar

ContactosEmpresa.vue

Lista de compañeros de la misma empresa: foto, nombre, email, sector e interno

🔭 Próximas funcionalidades
Separación de equipos IT como entidad independiente del usuario

Planes de soporte por horas con contador regresivo y control automático

Comentarios técnicos por ticket en tabla ticket_comentarios

Subida de documentos técnicos a Supabase Storage

Asignación de vendedores y locales en pedidos

Registro automático de sesiones remotas (futura integración con RustDesk)

⚙️ Scripts útiles
bash
Copiar
Editar
# Clonar el proyecto y correr localmente
git clone https://github.com/darioburda/bitguard.git
cd bitguard
npm install
npm run dev

# Desplegar funciones Edge
supabase functions deploy registrar-actualizacion-ticket

# Migrar base de datos y cargar seeds
# (Comandos específicos según configuración local)
👥 Autores
Darío Burda

Nicolás Burda

sql
Copiar
Editar
