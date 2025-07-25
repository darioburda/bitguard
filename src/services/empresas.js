import { supabase } from './supabase';

export const getEmpresas = async () => {
  const { data, error } = await supabase
    .from('empresas')
    .select(`
      id,
      nombre,
      email_contacto,
      telefono,
      direccion,
      cuit,
      visitas_consumidas,
      minutos_consumidos,
      minutos_excedidos,
      plan_id,
      planes(nombre, minutos_incluidos, visitas_incluidas)
    `)
    .order('nombre', { ascending: true });

  if (error) throw error;

  const empresas = data.map(e => ({
    ...e,
    plan_nombre: e.planes?.nombre || null,
    minutos_incluidos: e.planes?.minutos_incluidos || 0,
    visitas_incluidas: e.planes?.visitas_incluidas || 0,
    minutos_restantes: e.planes?.minutos_incluidos != null
      ? e.planes.minutos_incluidos - e.minutos_consumidos
      : null,
    visitas_restantes: e.planes?.visitas_incluidas != null
      ? e.planes.visitas_incluidas - e.visitas_consumidas
      : null
  }));

  return empresas;
};


export const getEmpresaById = async (id) => {
  const { data, error } = await supabase
    .from('empresas')
    .select(`
      id,
      nombre,
      email_contacto,
      telefono,
      direccion,
      cuit,
      visitas_consumidas,
      minutos_consumidos,
      minutos_excedidos,
      plan_id
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateEmpresa = async (id, updates) => {
  const { error } = await supabase
    .from('empresas')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('[updateEmpresa] Error:', error);
    throw error;
  }
};

export const crearEmpresa = async (nuevaEmpresa) => {
  const { error } = await supabase
    .from('empresas')
    .insert([nuevaEmpresa]);

  if (error) throw error;
};

export const getAllEmpresas = getEmpresas; // Alias por consistencia

export const deleteEmpresaById = async (id) => {
  const { error } = await supabase
    .from('empresas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[deleteEmpresaById] Error:', error);
    throw error;
  }
};


export const getEmpresaConResumen = async (id) => {
  // Obtener empresa base
  const { data: empresa, error } = await supabase
    .from('empresas')
    .select('id, nombre, email_contacto, telefono, direccion, cuit, plan_id')
    .eq('id', id)
    .single();

  if (error || !empresa) throw error || new Error('Empresa no encontrada');

  // Obtener plan
  if (empresa.plan_id) {
    const { data: plan, error: planError } = await supabase
      .from('planes')
      .select('nombre, minutos_incluidos, visitas_incluidas')
      .eq('id', empresa.plan_id)
      .single();
    if (planError) throw planError;
    empresa.plan = plan;
  }

  // Calcular métricas desde tickets cerrados
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('minutos_usados, fue_visita')
    .eq('empresa_id', id)
    .eq('estado', 'cerrado');

  if (ticketsError) throw ticketsError;

  let minutos = 0;
  let visitas = 0;

  for (const ticket of tickets || []) {
    minutos += ticket.minutos_usados ?? 0;
    if (ticket.fue_visita) visitas += 1;
  }

  empresa.minutos_consumidos = minutos;
  empresa.visitas_consumidas = visitas;

  return {
  ...empresa,
  plan: empresa.plan || { nombre: '', minutos_incluidos: 0, visitas_incluidas: 0 }
};

};
