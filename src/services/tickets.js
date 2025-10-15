import { supabase } from './supabase';

// 1. Obtener todos los tickets (para ABM admin)
export async function getAllTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      tipo,
      descripcion,
      titulo,
      tema_ayuda,
      estado,
      created_at,
      empresa_id,
      empresas ( nombre ),
      user_profiles!tickets_usuario_id_fkey ( display_name ),
      tecnico:user_profiles!tickets_tecnico_id_fkey ( display_name )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAllTickets] Error:', error);
    throw error;
  }

  return data.map(ticket => ({
    ...ticket,
    empresa_nombre: ticket.empresas?.nombre || 'Sin empresa',
    usuario_nombre: ticket.user_profiles?.display_name || 'Desconocido',
    tecnico_nombre: ticket.tecnico?.display_name || 'No asignado'
  }));
}

// 2. Crear nuevo ticket
export async function crearTicket(ticketData) {
  // 1) Sesión
  const { data: { user }, error: sessErr } = await supabase.auth.getUser()
  if (sessErr || !user) throw new Error('Sesión no válida')

  // 2) usuario_id (si no vino del form)
  const usuarioId = ticketData.usuario_id || user.id

  // 3) empresa_id (si no vino del form → lo saco del perfil)
  let empresaId = ticketData.empresa_id ?? null
  if (!empresaId) {
    const { data: perfil, error: perfilErr } = await supabase
      .from('user_profiles')
      .select('empresa_id')
      .eq('id', usuarioId)
      .single()
    if (perfilErr) throw perfilErr
    empresaId = perfil?.empresa_id ?? null
  }

  // 4) Validaciones finales (evita 23502)
  if (!usuarioId) throw new Error('usuario_id requerido')
  if (!empresaId) throw new Error('empresa_id requerido')

  // 5) Insert limpio
  const cleaned = {
    empresa_id: empresaId,
    tipo: ticketData.tipo || 'Remoto',
    titulo: (ticketData.titulo || '').trim(),
    tema_ayuda: (ticketData.tema_ayuda || '').trim(),
    descripcion: (ticketData.descripcion || '').trim(),
    usuario_id: usuarioId,
    tecnico_id: ticketData.tecnico_id || null,
    estado: ticketData.tecnico_id ? 'Activo' : 'Abierto',
    created_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('tickets').insert([cleaned])
  if (error) {
    console.error('[crearTicket] Error:', error)
    throw error
  }
}


// 3. Obtener tickets por empresa
export async function getTicketsPorEmpresa(empresaId) {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// 4. Obtener ticket por ID con relaciones
export async function getTicketById(id) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      tipo,
      descripcion,
      titulo,
      tema_ayuda,
      estado,
      usuario_id,
      tecnico_id,
      empresa_id,
      created_at,
      empresas (
        id,
        nombre
      ),
      user_profiles!tickets_usuario_id_fkey (
        display_name,
        email
      ),
      tecnico:user_profiles!tickets_tecnico_id_fkey (
        display_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getTicketById] Error al obtener ticket:', error);
    throw error;
  }

  return data;
}

// 5. Actualizar ticket
export async function actualizarTicket(id, updates) {
  const { error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[actualizarTicket] Error:', error);
    throw error;
  }
}

// 6. Eliminar ticket
export async function eliminarTicket(id) {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[eliminarTicket] Error:', error);
    throw error;
  }
}

// 7. Crear actualización de ticket (via Edge Function Supabase)
export async function crearActualizacionTicket({
  ticket_id,
  tecnico_id,
  descripcion,
  minutos_usados,
  fue_visita,
  estado_ticket,
  tipo_evento = 'actualizacion',
  tipo_soporte = null,
  nuevo_tecnico_id = null
}) {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    console.error('[crearActualizacionTicket] No se pudo obtener sesión Supabase:', sessionError);
    throw new Error('No se pudo obtener el token de autenticación.');
  }

  const payload = {
    ticket_id,
    tecnico_id,
    descripcion,
    minutos_usados,
    fue_visita,
    estado_ticket,
    tipo_evento,
    tipo_soporte,
    nuevo_tecnico_id
  };

  console.log('[crearActualizacionTicket] Enviando payload:', payload);

  const response = await fetch('https://yjqstwwltjefqtsxlbsa.supabase.co/functions/v1/registrar-actualizacion-ticket', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(payload)
  });

  const rawText = await response.text();
  console.log('[crearActualizacionTicket] HTTP Status:', response.status);
  console.log('[crearActualizacionTicket] Respuesta RAW:', rawText);

  let result;
  try {
    result = JSON.parse(rawText);
  } catch (e) {
    console.error('[crearActualizacionTicket] No se pudo parsear JSON:', rawText);
    throw new Error('Respuesta inválida del servidor.');
  }

  if (!response.ok) {
    console.error('[crearActualizacionTicket] Error HTTP:', response.status);
    console.error('[crearActualizacionTicket] Detalle:', result);
    throw new Error(result.error || 'Error al registrar actualización');
  }

  return result;
}


// 8. Obtener actualizaciones de un ticket (foto y rol del AUTOR de la actualización)
export const getActualizacionesPorTicketId = async (ticketId) => {
  const { data, error } = await supabase
    .from('ticket_updates')
    .select(`
      id,
      ticket_id,
      tecnico_id,
      descripcion,
      minutos_usados,
      fue_visita,
      estado_ticket,
      tipo_evento,
      tipo_soporte,
      nuevo_tecnico_id,
      created_at,
      autor:user_profiles!ticket_updates_tecnico_id_fkey (
        display_name,
        photo,
        is_admin
      )
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getActualizacionesPorTicketId] Error:', error);
    throw error;
  }

  return (data ?? []).map(a => ({
    ...a,
    actor_nombre: a.autor?.display_name || 'Usuario',
    actor_avatar_url: a.autor?.photo || null,
    actor_is_admin: !!a.autor?.is_admin,
  }));
};





// 9. Registrar cambios importantes (tipo, técnico, estado)
export async function registrarCambiosTicket(ticketAnterior, ticketNuevo, userId, eventoForzado = null) {
  const cambios = [];

  if (eventoForzado === 'cierre_ticket') {
    cambios.push({
      tipo_evento: 'cierre_ticket',
      descripcion: `El ticket fue cerrado.`
    });
  }

  if (ticketAnterior.tipo !== ticketNuevo.tipo) {
    cambios.push({
      tipo_evento: 'cambio_tipo_soporte',
      tipo_soporte: ticketNuevo.tipo,
      descripcion: `Cambio de tipo de soporte a ${ticketNuevo.tipo}`
    });
  }

  if (ticketAnterior.tecnico_id !== ticketNuevo.tecnico_id && ticketNuevo.tecnico_id) {
    let nuevoTecnico = null;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', ticketNuevo.tecnico_id)
        .single();
      if (!error) {
        nuevoTecnico = data.display_name;
      }
    } catch (e) {
      console.warn('No se pudo obtener el nombre del nuevo técnico:', e);
    }

    cambios.push({
      tipo_evento: 'cambio_tecnico',
      nuevo_tecnico_id: ticketNuevo.tecnico_id,
      descripcion: `Ticket reasignado al técnico: ${nuevoTecnico || 'Nuevo técnico'}`
    });
  }

  if (cambios.length === 0) return;

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('No se pudo obtener el token de autenticación.');
  }

  for (const cambio of cambios) {
    try {
      const response = await fetch('https://yjqstwwltjefqtsxlbsa.supabase.co/functions/v1/registrar-actualizacion-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          ticket_id: ticketNuevo.id,
          tecnico_id: userId,
          descripcion: cambio.descripcion,
          minutos_usados: 0,
          fue_visita: false,
          estado_ticket: ticketNuevo.estado,
          tipo_evento: cambio.tipo_evento,
          tipo_soporte: cambio.tipo_soporte || null,
          nuevo_tecnico_id: cambio.nuevo_tecnico_id || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[registrarCambiosTicket] Error:', result.error || result);
        throw new Error(result.error || 'Error al registrar cambio en ticket');
      }
    } catch (err) {
      console.error('[registrarCambiosTicket] Error de red o de función:', err);
      throw err;
    }
  }
}
