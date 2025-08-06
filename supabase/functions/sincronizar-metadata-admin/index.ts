// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // Traer todos los perfiles
    const { data: perfiles, error } = await supabaseClient
      .from('user_profiles')
      .select('id, display_name, is_admin')

    if (error) throw error

    const errores = []

    // Para cada perfil, actualizar metadata
    for (const perfil of perfiles) {
      const { id, display_name, is_admin } = perfil

      const { error: updateError } = await supabaseClient.auth.admin.updateUserById(id, {
        user_metadata: { is_admin, display_name }
      })

      if (updateError) {
        errores.push({ id, error: updateError.message })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Sincronización completada',
        errores: errores.length > 0 ? errores : null
      }),
      { status: 200 }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    )
  }
})
