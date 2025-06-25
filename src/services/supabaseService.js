import { supabase } from '../lib/supabaseClient'

// Servicio de cuentas
export const cuentaService = {
  async obtenerPorUsuario(usuarioId) {
    const { data, error } = await supabase
      .from('cuentas')
      .select(`
        *,
        personajes (*)
      `)
      .eq('usuario_id', usuarioId)
    return { data, error }
  },

  async crear(cuenta) {
    const { data, error } = await supabase
      .from('cuentas')
      .insert([cuenta])
      .select()
    return { data, error }
  },

  async actualizar(id, updates) {
    const { data, error } = await supabase
      .from('cuentas')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('cuentas')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Servicio de personajes
export const personajeService = {
  async crear(personaje) {
    const { data, error } = await supabase
      .from('personajes')
      .insert([personaje])
      .select()
    return { data, error }
  },

  async actualizar(id, updates) {
    const { data, error } = await supabase
      .from('personajes')
      .update(updates)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async eliminar(id) {
    const { error } = await supabase
      .from('personajes')
      .delete()
      .eq('id', id)
    return { error }
  }
}

// Servicio de historial
export const historialService = {
  async crear(entrada) {
    const { data, error } = await supabase
      .from('historial_ingresos')
      .insert([entrada])
      .select()
    return { data, error }
  },

  async obtenerPorCuenta(cuentaId) {
    const { data, error } = await supabase
      .from('historial_ingresos')
      .select('*')
      .eq('cuenta_id', cuentaId)
      .order('fecha_ingreso', { ascending: false })
    return { data, error }
  }
}

// Servicio de configuraciones
export const configService = {
  async obtener(usuarioId) {
    const { data, error } = await supabase
      .from('configuraciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .single()
    return { data, error }
  },

  async actualizar(config) {
    // Intentar actualizar primero
    const { data: updateData, error: updateError } = await supabase
      .from('configuraciones')
      .update(config)
      .eq('usuario_id', config.usuario_id)
      .select()
    
    // Si no existe, crear nuevo
    if (updateError || !updateData || updateData.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('configuraciones')
        .insert([config])
        .select()
      return { data: insertData, error: insertError }
    }
    
    return { data: updateData, error: updateError }
  }
}