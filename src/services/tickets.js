import { supabase } from './supabase';

export async function getAllTickets() {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      tipo,
      descripcion,
      fue_visita,
      fecha,
      estado,
      created_at,
      actualizado,
      empresas ( nombre ),
      user_profiles!tickets_usuario_id_fkey ( display_name ),
      tecnico:user_profiles!tickets_tecnico_id_fkey ( display_name )
    `)
    .order('created_at', { ascending: false }); // <- corregido acá

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






// 1. Crear ticket
export const crearTicket = async (ticketData) => {
    console.log('[crearTicket] Enviando:', ticketData); // 👈 Agregá esto
  const { error } = await supabase
    .from('tickets')
    .insert([{
      ...ticketData,
      fecha: new Date().toISOString(),
      estado: ticketData.estado || 'Abierto',

      actualizado: new Date().toISOString(),
    }]);

  if (error) {
    console.error('[crearTicket] Error:', error);
    throw error;
  }
};

// 2. Obtener tickets por empresa
export const getTicketsPorEmpresa = async (empresaId) => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data;
};

// 3. Obtener ticket por ID
export const getTicketById = async (id) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      tipo,
      descripcion,
      fue_visita,
      estado,
      tecnico_id,
      usuario_id,
      minutos_usados
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getTicketById] Error:', error);
    throw error;
  }

//   console.log('[getTicketById] Data:', data); // 👈 importante para verificar
  return data;
};



// 4. Actualizar ticket (ej: cerrarlo)
export const actualizarTicket = async (id, updates) => {
  const { error } = await supabase
    .from('tickets')
    .update({
      ...updates,
      actualizado: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('[actualizarTicket] Error:', error);
    throw error;
  }
};

// 5. Eliminar ticket
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
