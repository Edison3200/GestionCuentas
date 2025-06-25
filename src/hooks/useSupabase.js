import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const useSupabase = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const ensureUser = async () => {
    const sesionActiva = localStorage.getItem('sesion-activa')
    if (!sesionActiva) return null

    try {
      const usuario = JSON.parse(sesionActiva)
      
      // Verificar si el usuario existe en la tabla usuarios
      const { data: existingUser, error } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', usuario.email)
        .single()

      if (error && error.code === 'PGRST116') {
        // Usuario no existe, crearlo
        const { data: newUser, error: createError } = await supabase
          .from('usuarios')
          .insert([{
            usuario: usuario.usuario,
            nombre: usuario.nombre,
            email: usuario.email,
            icono: usuario.icono || 'user'
          }])
          .select('id')
          .single()

        if (createError) {
          console.error('Error creando usuario:', createError)
          return null
        }
        return newUser.id
      }

      if (error) {
        console.error('Error verificando usuario:', error)
        return null
      }

      return existingUser.id
    } catch (error) {
      console.error('Error en ensureUser:', error)
      return null
    }
  }

  return { loading, error, user, ensureUser }
}