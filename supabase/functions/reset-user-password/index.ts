// supabase/functions/reset-user-password/index.ts
// Resetea la contraseña de un usuario específico (solo admins).
// Método: POST
// Body JSON: { "userId": "uuid-del-usuario", "newPassword": "********" }

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*"; // Ajustá si querés restringir CORS
const MIN_LEN = 6;

function jsonResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      ...headers,
    },
  });
}

serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Missing/invalid Authorization header" }, 401);
    }

    // 1) Verificar sesión del caller con el token (anon client con el header Authorization)
    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "No se pudo obtener el usuario autenticado" }, 401);
    }

    // 2) Verificar que sea admin (usando user_metadata.is_admin o un claim que tengas)
    const isAdmin =
      (userData.user.user_metadata && userData.user.user_metadata.is_admin === true) ||
      (userData.user.app_metadata && userData.user.app_metadata.role === "admin");

    if (!isAdmin) {
      return jsonResponse({ error: "Acceso denegado. Se requieren privilegios de administrador." }, 403);
    }

    // 3) Parsear body
    const body = await req.json().catch(() => null) as { userId?: string; newPassword?: string } | null;
    if (!body || !body.userId || !body.newPassword) {
      return jsonResponse({ error: "Faltan parámetros: userId y newPassword" }, 400);
    }

    if (typeof body.newPassword !== "string" || body.newPassword.length < MIN_LEN) {
      return jsonResponse({ error: `La contraseña debe tener al menos ${MIN_LEN} caracteres` }, 400);
    }

    // 4) Usar Service Role para actualizar la contraseña
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(body.userId, {
      password: body.newPassword,
    });

    if (updErr) {
      return jsonResponse({ error: `No se pudo actualizar la contraseña: ${updErr.message}` }, 500);
    }

    // (Opcional) Podés registrar un log en una tabla "audit_logs" si querés.
    // await supabaseAdmin.from("audit_logs").insert({
    //   actor_id: userData.user.id,
    //   action: "reset_user_password",
    //   target_user_id: body.userId,
    // });

    return jsonResponse({ ok: true, message: "Contraseña actualizada correctamente" }, 200);
  } catch (e) {
    return jsonResponse({ error: "Error inesperado", detail: String(e) }, 500);
  }
});
