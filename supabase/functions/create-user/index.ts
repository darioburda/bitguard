import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// ✅ Función helper para respuestas CORS
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  try {
    const { email, password, display_name, equipo, sector, is_admin = false } = await req.json();

    if (!email || !password || !display_name) {
      return jsonResponse({ error: "Faltan campos obligatorios" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ Crear usuario en Auth con user_metadata
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name,
        equipo,
        sector,
        is_admin
      }
    });

    if (userError || !userData.user?.id) {
      return jsonResponse({ error: userError?.message || "Error creando usuario" }, 400);
    }

    const userId = userData.user.id;

    // ✅ Insertar en user_profiles
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: userId,
      email,
      display_name,
      equipo,
      sector,
      is_admin,
    });

    if (profileError) {
      return jsonResponse({ error: profileError.message }, 500);
    }

    return jsonResponse({ success: true });
  } catch (e) {
    return jsonResponse({ error: "Error inesperado: " + e.message }, 500);
  }
});
