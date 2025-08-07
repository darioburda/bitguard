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
  const cleaned = {
    ...ticketData,
    estado: ticketData.estado || 'Abierto',
    created_at: new Date().toISOString(),
    empresa_id: ticketData.empresa_id || null,
    usuario_id: ticketData.usuario_id || null,
    tecnico_id: ticketData.tecnico_id || null,
  };

  const { error } = await supabase
    .from('tickets')
    .insert([cleaned]);

  if (error) {
    console.error('[crearTicket] Error:', error);
    throw error;
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

// 8. Obtener actualizaciones de un ticket
export async function getActualizacionesPorTicketId(ticketId) {
  const { data, error } = await supabase
    .from('ticket_updates')
    .select(`
      id,
      descripcion,
      minutos_usados,
      fue_visita,
      estado_ticket,
      tipo_evento,
      tipo_soporte,
      nuevo_tecnico_id,
      created_at,
      tecnico:user_profiles!ticket_updates_tecnico_id_fkey ( display_name )
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[getActualizacionesPorTicketId] Error:', error);
    throw error;
  }

  return data.map(a => ({
    ...a,
    tecnico_nombre: a.tecnico?.display_name || 'Técnico desconocido'
  }));
}

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
