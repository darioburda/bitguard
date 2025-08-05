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
- ✅ En MyProfile.vue ya no se permite enlazar a RustDesk directamente, solo visible en ABM por admins  
- ✅ Nuevo botón "Tomar Ticket" con ícono de mano e integración con modal de confirmación  
- ✅ Estado intermedio "Activo" para tickets tomados por un técnico  
- ✅ Nueva animación fluida al expandir datos técnicos de usuarios y empresas  
- ✅ Checkbox fijo visible siempre en cada card  
- ✅ Modal de eliminación con estética mejorada y comportamiento condicional  
- ✅ Paginación con navegación completa: primero, anterior, siguiente, último  
- ✅ Componente reutilizable `MainButton.vue` con variantes (agregar, editar, borrar, default)  
- ✅ Soporte para íconos dinámicos, posición (izquierda/derecha) y texto opcional  
- ✅ Soporte para tamaños (sm, md, lg) y comportamiento responsivo  
- ✅ Vista Acciones.vue optimizada con MainButton, transiciones, toggle y contador  
- ✅ En mobile, los botones se muestran centrados y con ancho reducido (w-[80%])  
- ✅ Diseño consistente de botones en desktop: íconos alineados, altura y tipografía uniforme  
- ✅ Filtros de usuarios con toggle de detalles integrados en la misma línea que la búsqueda  
- ✅ Grilla de usuarios y empresas con `min-h-[600px]` para evitar saltos visuales  
- ✅ Mensaje de “No se encontraron resultados” centrado dentro de la grilla  
- ✅ Layout de filtros y resultados mantiene el ancho al aplicar cualquier filtro  
- ✅ Nuevo componente `FiltrosEntidad.vue` reutilizable para aplicar filtros en usuarios y empresas  
- ✅ Filtros en AbmEmpresas.vue por nombre, plan y sector con chips de filtros activos y botón de "Quitar todos"  
- ✅ Animaciones suaves al filtrar empresas con transición completa de entrada y salida  
- ✅ Gráficos de soporte y visitas se cargan luego de completar animaciones con fade  
- ✅ Cards de empresa con comportamiento visual unificado respecto a usuario (pb, mb, transition)  
- ✅ Soporte de borradores automáticos en formularios usando `sessionStorage` (solo se mantiene en caso de refresh)  
- ✅ Eliminación del borrador al salir de la vista (`onBeforeRouteLeave`)  
- ✅ Componente `AlertMessage` mejorado con estética BitGuard y colores diferenciados (success, info, danger)  
- ✅ Feedback visual centralizado usando `sessionStorage` para comunicar entre vistas (ej. MyProfileEdit → MyProfile)  
- ✅ AutoDismiss en feedback:  
  - Mensajes de éxito e información se ocultan tras 3 segundos  
  - Errores (danger) se mantienen visibles hasta ser corregidos  
- ✅ Protección básica contra inyección en campos input de formularios (escape en frontend + validación backend sugerida)  
- ✅ Diseño desacoplado: `Formulario.vue` reutilizable con v-model y props externas (`profile`, `editing`, `onSubmit`)  
- ✅ Botón flotante `ChatBitButton` con animación, fondo verde y logo blanco, ahora integrado por vista para mejor animación  
- ✅ Tamaño del ícono de chat ajustado para mejorar la visibilidad sin agrandar el contenedor flotante  
- ✅ Soporte visual uniforme para `ChatBitButton` en MyProfile, AbmUsuarios, AbmTickets, EditarTicket, MisTickets, etc.  
- ✅ Composable `useFiltradoEntidad.js` para filtrar cualquier lista con campos personalizables y filtros múltiples (empresa, sector, plan, estado, tipo, etc.)  
- ✅ Contador de resultados como chip a la derecha del layout  
- ✅ Búsqueda por nombre, email y número de interno en ContactosEmpresa.vue  
- ✅ Soporte para filtros reactivos en todas las vistas principales (usuarios, empresas, contactos, tickets)

---

## ✅ Checklist de buenas prácticas en formularios (BitGuard)

- Usar `sessionStorage` para guardar automáticamente el borrador del formulario en caso de refresco  
- Cargar el borrador desde `sessionStorage` al entrar en la vista  
- Eliminar el borrador si el usuario cambia de página (con `onBeforeRouteLeave`)  
- Validar si el usuario hizo cambios antes de guardar (evitar updates innecesarios)  
- Prevenir nombres duplicados o vacíos en campos clave (como nombre de usuario)  
- Mostrar feedback visual con `AlertMessage.vue`, debajo de los botones de acción  
- Diferenciar tipos de feedback:  
  - ✅ `success` e `info` se ocultan automáticamente a los 3 segundos  
  - ❌ `danger` permanece visible para que el usuario corrija  
- Usar `sessionStorage` para pasar mensajes entre vistas (`perfil_feedback`, `feedback_type`)  
- Recuperar y mostrar feedback solo si existe, luego eliminar del storage  
- Deshabilitar campos no editables (`sector`, `equipo`, etc.) con `disabled` y estilo `bg-gray-100`  
- Mantener los botones de acción (`Volver`, `Actualizar`, etc.) dentro de `AccionesDetalle.vue`  
- Usar componentes reutilizables como `Formulario.vue` y `FormularioLayout.vue`  
- Prevenir inyección HTML: no mostrar contenido editable directamente como HTML (`v-text`, no `v-html`)  
- Limpiar los datos al guardar exitosamente (`removeItem('draft_profile')`)  

---

## 🧱 Tecnologías utilizadas

| Categoría       | Herramientas                                     |
|-----------------|--------------------------------------------------|
| **Frontend**    | Vue 3 + Vite + TailwindCSS                       |
| **Backend**     | Supabase (Auth, Database, Storage, Edge Functions) |
| **Base de datos** | PostgreSQL (gestionado desde Supabase)        |
| **Realtime**    | Supabase Realtime Channels                       |
| **Storage**     | Supabase Buckets (profile-picture, post-image)   |
| **Estilo**      | Tailwind + clases personalizadas                 |
| **Gráficos**    | vue-chartjs + chart.js                           |
| **Animaciones** | SweetAlert2, TransitionExpand, animaciones CSS   |

---

## 📁 Estructura del proyecto (parcial)

src/
├── assets/ # Imágenes y recursos estáticos
├── components/ # Componentes reutilizables (botones, alerts, loaders, etc.)
│ ├── MainButton.vue
│ ├── Acciones.vue
│ ├── CheckboxSeleccion.vue
│ ├── FiltrosUsuarios.vue
│ ├── FiltrosEntidad.vue # ✅ Nuevo componente reutilizable
│ ├── Paginador.vue
│ ├── SoporteChart.vue
│ ├── VisitasChart.vue
│ ├── TransitionExpand.vue
│ ├── ChatBitButton.vue # ✅ Botón flotante con animación
├── pages/ # Vistas principales (Home, Login, ABM, etc.)
├── modules/
│ ├── home/
│ ├── publicaciones/
│ ├── usuarios/
│ ├── empresas/
│ ├── pedidos/
│ └── tickets/
├── composables/
│ └── useUsuarios.js
│ └── useFiltradoEntidad.js
├── services/
├── styles/
└── router/

yaml
Copiar
Editar

---

## 🔐 Seguridad y control de acceso

- Rutas protegidas según el estado de sesión y el rol (`is_admin`)
- Verificación en tiempo real mediante `subscribeToAuthState`
- Vistas administrativas accesibles solo para usuarios con permisos (`abm-usuarios`, `abm-empresas`, `abm-tickets`)

---

## 🧩 Gestión de empresas y planes

Cada empresa contiene:  
`nombre`, `email_contacto`, `telefono`, `direccion`, `cuit`, `plan_id`,  
`visitas_consumidas`, `minutos_consumidos`, `minutos_excedidos`, `updated_at`

**Validaciones**:
- Nombre obligatorio  
- Email con formato válido  
- CUIT con formato XX-XXXXXXXX-X  
- Plan obligatorio  

**Visualización y consumo**:
- Cards con `BadgePlan` y datos de consumo  
- Botón toggle para mostrar/ocultar métricas  
- Gráfico tipo torta (`vue-chartjs`): usados, restantes, excedidos (violeta)  
- Tooltips personalizados y formato 1h 20m / 5h 0m  
- Altura mínima y transiciones suaves  
- Filtros por nombre, sector y plan (reutilizando `FiltrosEntidad.vue`)  

---

## 🆘 Gestión de tickets de soporte

ABM completo: listado, creación, edición y eliminación

**Campos**: empresa, usuario solicitante, técnico asignado, tipo, minutos usados, fue_visita, estado

**Funciones destacadas**:
- Botón "Tomar" con ícono de mano  
- Modal de confirmación  
- Estado intermedio "Activo"  
- Validaciones al editar (minutos y técnico según estado)  
- Actualización automática de `updated_at`

---

## 👤 Vista para usuarios no administradores

- `MyProfile.vue`: datos personales, `BadgePlan`, `interno_telefono` no editable, gráficos, sin enlace RustDesk  
- `ContactosEmpresa.vue`: lista de compañeros con foto, nombre, email, interno y sector  

---

## 🔭 Próximas funcionalidades

- Separación de equipos IT como entidad independiente del usuario  
- Comentarios técnicos por ticket (tabla `ticket_comentarios`)  
- Registro automático de sesiones remotas (RustDesk)  
- Subida de documentos técnicos (Supabase Storage)  
- Asignación de locales y vendedores para pedidos  
- Nuevas vistas de pedidos con detalle por artículo, subtotal y total  

---

## ⚙️ Scripts útiles

```bash
# Clonar el proyecto y correr localmente
git clone https://github.com/darioburda/bitguard.git
cd bitguard
npm install
npm run dev

# Desplegar funciones Edge
supabase functions deploy registrar-actualizacion-ticket
👥 Autores
Darío Burda
Nicolás Burda

yaml
Copiar
Editar
