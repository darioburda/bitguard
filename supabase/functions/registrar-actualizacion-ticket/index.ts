import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Headers CORS globales correctos
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type"
};

serve(async (req) => {
  // Soporte preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {
      ticket_id,
      tecnico_id,
      descripcion,
      minutos_usados = 0,
      fue_visita = false,
      estado_ticket
    } = await req.json();

    if (!ticket_id || !tecnico_id || !descripcion) {
      return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // 1. Buscar ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("usuario_id")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      return new Response(JSON.stringify({ error: "No se encontró el ticket" }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // 2. Buscar empresa del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from("user_profiles")
      .select("empresa_id")
      .eq("id", ticket.usuario_id)
      .single();

    if (perfilError || !perfil) {
      return new Response(JSON.stringify({ error: "No se encontró el perfil del usuario" }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // 3. Insertar actualización
    const { error: insertError } = await supabase
      .from("ticket_updates")
      .insert([{
        ticket_id,
        tecnico_id,
        descripcion,
        minutos_usados,
        fue_visita,
        estado_ticket
      }]);

    if (insertError) {
      return new Response(JSON.stringify({ error: "Error al insertar actualización" }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // 4. Actualizar empresa solo si minutos > 0 o fue_visita es true
    if (minutos_usados > 0 || fue_visita) {
      const { error: rpcError } = await supabase.rpc("incrementar_consumos_empresa", {
        empresa_id_input: perfil.empresa_id,
        minutos_input: minutos_usados,
        sumar_visita: fue_visita
      });

      if (rpcError) {
        return new Response(JSON.stringify({
          error: "Error al actualizar consumo de empresa",
          detalle: rpcError.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (e) {
    console.error("[registrar-actualizacion-ticket] Error:", e);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
