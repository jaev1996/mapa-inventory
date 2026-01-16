import 'server-only'
import { cache } from 'react'
import { createClient } from './server'
import { UserRole } from '@/lib/types'

export const getUserRole = cache(async (): Promise<UserRole | null> => {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch role from profiles table
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (error) {
        if (error.code === '42P17' || error.message.includes('recursion')) {
            console.error('CRITICAL: RLS Recursion detected in Supabase. Check your policies.');
            return 'cliente'; // Fallback seguro
        }
        // Código PGRST116 significa que no devolvió filas (el perfil no existe)
        if (error.code === 'PGRST116') {
            console.warn('Perfil no encontrado para el usuario:', user.id);
            return 'cliente'; // Fallback a rol por defecto
        }

        console.error('Error fetching user role:', JSON.stringify(error, null, 2))
        return 'cliente'
    }

    return profile?.role as UserRole
})
