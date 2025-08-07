import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type"
};

serve(async (req) => {
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
      estado_ticket,
      tipo_evento = "actualizacion",
      tipo_soporte = null,
      nuevo_tecnico_id = null
    } = await req.json();

    console.log("[Payload recibido]", {
      ticket_id,
      tecnico_id,
      descripcion,
      minutos_usados,
      fue_visita,
      estado_ticket,
      tipo_evento,
      tipo_soporte,
      nuevo_tecnico_id
    });

    if (!ticket_id || !tecnico_id || !descripcion || !tipo_evento) {
      console.error("[Validación] Faltan campos obligatorios");
      return new Response(JSON.stringify({ error: "Faltan campos obligatorios" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select("usuario_id")
      .eq("id", ticket_id)
      .single();

    if (ticketError || !ticket) {
      console.error("[Error] No se encontró el ticket:", ticketError);
      return new Response(JSON.stringify({ error: "No se encontró el ticket" }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("user_profiles")
      .select("empresa_id")
      .eq("id", ticket.usuario_id)
      .single();

    if (perfilError || !perfil) {
      console.error("[Error] No se encontró el perfil del usuario:", perfilError);
      return new Response(JSON.stringify({ error: "No se encontró el perfil del usuario" }), {
        status: 404,
        headers: corsHeaders
      });
    }

    const insertPayload = {
      ticket_id,
      tecnico_id,
      descripcion,
      minutos_usados,
      fue_visita,
      estado_ticket,
      tipo_evento,
      tipo_soporte,
      nuevo_tecnico_id
    };

    console.log("[Insertando en ticket_updates]", insertPayload);

    const { error: insertError } = await supabase
      .from("ticket_updates")
      .insert([insertPayload]);

    if (insertError) {
      console.error("[InsertError]", insertError);
      return new Response(JSON.stringify({ error: "Error al insertar actualización" }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (minutos_usados > 0 || fue_visita) {
      const { error: rpcError } = await supabase.rpc("incrementar_consumos_empresa", {
        empresa_id_input: perfil.empresa_id,
        minutos_input: minutos_usados,
        sumar_visita: fue_visita
      });

      if (rpcError) {
        console.error("[RPC Error]", rpcError);
        return new Response(JSON.stringify({
          error: "Error al actualizar consumo de empresa",
          detalle: rpcError.message
        }), {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    console.log("[✅ Success] Actualización registrada con éxito.");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (e) {
    console.error("[❌ Error general en registrar-actualizacion-ticket]:", e);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
