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
      horas_consumidas,
      plan_id,
      planes(nombre)
    `)
    .order('nombre', { ascending: true });

  if (error) throw error;

  const empresas = data.map(e => ({
    ...e,
    plan_nombre: e.planes?.nombre || null
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
      horas_consumidas,
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
