import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Headers CORS básicos
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Función principal
serve(async (req) => {
  // Soporte para preflight OPTIONS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id } = await req.json();
    console.log("📥 Request recibido para user_id:", user_id);

    if (!user_id) {
      return new Response(JSON.stringify({ error: "Falta el user_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Obtener is_admin desde user_profiles
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user_id)
      .single();

    console.log("📋 Perfil traído:", profile);

    if (profileError) {
      console.error("❌ Error obteniendo perfil:", profileError);
      return new Response(JSON.stringify({ error: "No se pudo obtener el perfil" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Actualizar metadata en Supabase Auth
    console.log("🔄 Enviando metadata a Supabase Auth:", {
      id: user_id,
      is_admin: profile.is_admin,
    });

    const { error: updateError } = await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: {
        is_admin: profile.is_admin,
      },
    });

    if (updateError) {
      console.error("❌ Error al sincronizar metadata:", updateError);
      return new Response(JSON.stringify({ error: "Error al sincronizar metadata" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Metadata actualizada correctamente");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error inesperado:", error);
    return new Response(JSON.stringify({ error: "Error inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
