import { serve } from 'https://deno.land/std@0.192.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async (_req) => {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const nombres = [
    'Chadi - MK', 'Marcela', 'Silvina Salatino', 'Plotter - Calandra', 'Luciana RRHH',
    'Nora Acosta', 'Laura Roncoroni', 'Carlos Barbieri', 'Enrique Sabelli', 'Carola B.',
    'Daniel Gonzalez', 'Soledad Stabille', 'Vero Taller', 'Miriam Otazo', 'Liliana Valdez',
    'Sandra Facturacion', 'Seguridad - MK', 'Melisa Alfonso', 'Nancy Acosta', 'Ecommerce'
  ]

  const sistemasOperativos = ['Windows 7', 'Windows 10', 'Windows 11']
  const microprocesadores = ['i3', 'i5', 'i7']
  const tiposMemoria = ['DDR3', 'DDR4', 'DDR5']
  const tamanosMemoria = ['4GB', '8GB', '16GB', '32GB']
  const tiposDisco = ['SSD', 'Mecánico']
  const tamanosDisco = ['120GB', '250GB', '500GB', '1TB']
  const sectores = ['Administración', 'RRHH', 'Fabrica', 'Ecommerce', 'Diseño', 'Gerencia']

  const resultados = []

  for (const nombre of nombres) {
    const email = nombre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) + '@marcelakoury.com'

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: '123456',
      email_confirm: true
    })

    if (error || !data.user) {
      resultados.push({ nombre, email, status: 'error', error })
      continue
    }

    const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
    const rustdesk = Math.floor(1000 + Math.random() * 9000).toString()
    const interno = Math.floor(100 + Math.random() * 201).toString() // 100–300
    const ipPC = () => `10.0.0.${Math.floor(Math.random() * 255)}`
    const ipTel = () => `10.0.5.${Math.floor(Math.random() * 255)}`

    const perfil = {
      id: data.user.id,
      email,
      display_name: nombre,
      bio: 'Usuario generado automáticamente',
      sector: getRandom(sectores),
      equipo: `PC-${Math.floor(Math.random() * 100)}`,
      rustdesk,
      sistema_operativo: getRandom(sistemasOperativos),
      microprocesador: getRandom(microprocesadores),
      tipo_memoria: getRandom(tiposMemoria),
      tamano_memoria: getRandom(tamanosMemoria),
      tipo_disco: getRandom(tiposDisco),
      tamano_disco: getRandom(tamanosDisco),
      ip_pc: ipPC(),
      interno_telefono: interno,
      ip_telefono: ipTel()
    }

    const { error: insertError } = await supabaseAdmin.from('user_profiles').insert(perfil)

    if (insertError) {
      resultados.push({ nombre, email, status: 'error', error: insertError })
    } else {
      resultados.push({ nombre, email, status: 'ok' })
    }
  }

  return new Response(JSON.stringify(resultados, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
