import { supabase } from './supabase'

export async function syncUserMetadata(userId) {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      throw new Error('No hay sesión activa')
    }

    const token = data.session.access_token

    const res = await fetch(
      'https://yjqstwwltjefqtsxlbsa.supabase.co/functions/v1/sincronizar-user-metadata',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ auth token
        },
        body: JSON.stringify({ user_id: userId })
      }
    )

    const response = await res.json()

    if (!res.ok) {
      throw new Error(response.error || 'Error al sincronizar metadata')
    }

    console.log('✅ Metadata sincronizada:', response)
    return response
  } catch (error) {
    console.error('❌ Error al sincronizar metadata:', error.message)
  }
}
