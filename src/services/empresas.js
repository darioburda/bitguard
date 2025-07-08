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
