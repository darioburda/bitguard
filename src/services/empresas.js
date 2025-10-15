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

  return data.map(e => ({
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

  if (error) throw error;
};

export const crearEmpresa = async (nuevaEmpresa) => {
  const { error } = await supabase
    .from('empresas')
    .insert([nuevaEmpresa]);

  if (error) throw error;
};

export const getAllEmpresas = getEmpresas;

export const deleteEmpresaById = async (id) => {
  const { error } = await supabase
    .from('empresas')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getEmpresaConResumen = async (id) => {
  const { data: empresa, error } = await supabase
    .from('empresas')
    .select('id, nombre, email_contacto, telefono, direccion, cuit, plan_id')
    .eq('id', id)
    .single();

  if (error || !empresa) throw error || new Error('Empresa no encontrada');

  let plan = null;
  if (empresa.plan_id) {
    const { data: planData, error: planError } = await supabase
      .from('planes')
      .select('nombre, minutos_incluidos, visitas_incluidas')
      .eq('id', empresa.plan_id)
      .single();

    if (!planError) {
      plan = planData;
    }
  }

  const { data: actualizaciones, error: updatesError } = await supabase
    .from('ticket_updates')
    .select('minutos_usados, fue_visita, tickets!inner(empresa_id)')
    .eq('tickets.empresa_id', id);

  if (updatesError) throw updatesError;

  let minutos = 0;
  let visitas = 0;

  for (const update of actualizaciones || []) {
    minutos += update.minutos_usados ?? 0;
    if (update.fue_visita) visitas += 1;
  }

  return {
    ...empresa,
    plan: plan || { nombre: '', minutos_incluidos: 0, visitas_incluidas: 0 },
    minutos_consumidos: minutos,
    visitas_consumidas: visitas,
  };
};
