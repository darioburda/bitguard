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
export const crearTicket = async (ticketData) => {
  const { error } = await supabase
    .from('tickets')
    .insert([{
      ...ticketData,
      estado: ticketData.estado || 'Abierto',
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('[crearTicket] Error:', error);
    throw error;
  }
};

// 3. Obtener tickets por empresa
export const getTicketsPorEmpresa = async (empresaId) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

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
      created_at,
      empresas ( nombre ),
      user_profiles!tickets_usuario_id_fkey ( display_name, email ),
      tecnico:user_profiles!tickets_tecnico_id_fkey ( display_name, email )
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
export const actualizarTicket = async (id, updates) => {
  const { error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[actualizarTicket] Error:', error);
    throw error;
  }
};

// 6. Eliminar ticket
export const eliminarTicket = async (id) => {
  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[eliminarTicket] Error:', error);
    throw error;
  }
};

// 7. Crear actualización de ticket
export const crearActualizacionTicket = async ({
  ticket_id,
  tecnico_id,
  descripcion,
  minutos_usados,
  fue_visita,
  estado_ticket
}) => {
  const { error } = await supabase
    .from('ticket_updates')
    .insert([{
      ticket_id,
      tecnico_id,
      descripcion,
      minutos_usados,
      fue_visita,
      estado_ticket,
      created_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('[crearActualizacionTicket] Error:', error);
    throw error;
  }
};

// 8. Obtener actualizaciones de un ticket
export const getActualizacionesPorTicketId = async (ticketId) => {
  const { data, error } = await supabase
    .from('ticket_updates')
    .select(`
      id,
      descripcion,
      minutos_usados,
      fue_visita,
      estado_ticket,
      created_at,
      tecnico:user_profiles ( display_name )
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
};
