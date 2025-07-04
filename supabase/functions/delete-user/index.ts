import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Función helper para respuestas con CORS
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
};

serve(async (req) => {
  // Soporte para OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const { user_id } = await req.json();

  if (!user_id) {
    return jsonResponse({ error: "Falta user_id" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Eliminar de user_profiles
  const { error: profileError } = await supabase
    .from("user_profiles")
    .delete()
    .eq("id", user_id);

  if (profileError) {
    return jsonResponse({ error: "Error al borrar perfil: " + profileError.message }, 500);
  }

  // 2. Eliminar de auth.users
  const { error: authError } = await supabase.auth.admin.deleteUser(user_id);

  if (authError) {
    return jsonResponse({ error: "Error al borrar usuario auth: " + authError.message }, 500);
  }

  return jsonResponse({ success: true });
});
