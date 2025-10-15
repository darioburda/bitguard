

import { supabase } from './supabase'

export async function guardarSuscripcion(email) {
    const { error } = await supabase.from('suscripciones').insert([{ email }])
    return { error }
}

export async function existeSuscripcion(email) {
    const { data, error } = await supabase
        .from('suscripciones')
        .select('id')
        .eq('email', email)
        .maybeSingle()

    return {
        existe: !!data,
        error
    }
}


