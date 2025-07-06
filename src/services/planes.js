// ✅ Archivo: services/planes.js
import { supabase } from './supabase';

export const getAllPlanes = async () => {
  const { data, error } = await supabase
    .from('planes')
    .select('id, nombre')
    .order('nombre', { ascending: true });

  if (error) throw error;

  return data; // <--- no uses { data }
};
