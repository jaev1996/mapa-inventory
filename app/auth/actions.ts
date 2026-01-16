'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

const registerSchema = z.object({
    fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export async function login(formData: FormData) {
    const data = Object.fromEntries(formData)
    const parsed = loginSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Datos inválidos' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
    })

    if (error) {
        return { error: error.message }
    }

    // Check role to redirect
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role
        if (role === 'admin') {
            redirect('/admin/dashboard')
        } else {
            redirect('/dashboard')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const data = Object.fromEntries(formData)
    const parsed = registerSchema.safeParse(data)

    if (!parsed.success) {
        return { error: 'Datos inválidos' }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            data: {
                full_name: parsed.data.fullName,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Registro exitoso, por favor inicia sesión')
}

export async function signOutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
