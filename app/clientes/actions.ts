// app/clientes/actions.ts
'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { ClienteSchema } from '@/lib/schemas';

// Definición de tipos para el Cliente (¡Fundamental para TypeScript!)
export interface Cliente {
    idCliente: number;
    codigoCliente: string;
    nombreCliente: string;
    idVendedor: number; // Por ahora lo manejaremos como number
    telefonoCliente: string;
    direccionCliente: string;
}

// ------------------------------------------------
export interface ClienteFilters {
    nombre?: string;
    codigo?: string;
}

export async function getClientes(page = 1, pageSize = 10, filters?: ClienteFilters): Promise<{ data: Cliente[], count: number }> {
    let query = supabase
        .from('cliente')
        .select('*', { count: 'exact' });

    if (filters?.nombre) {
        query = query.ilike('nombreCliente', `%${filters.nombre}%`);
    }

    if (filters?.codigo) {
        query = query.ilike('codigoCliente', `%${filters.codigo}%`);
    }

    const { data, count, error } = await query
        .order('nombreCliente', { ascending: true })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
        console.error('Error al obtener clientes:', error);
        return { data: [], count: 0 };
    }

    return { data: data as Cliente[], count: count || 0 };
}

// ------------------------------------------------
// 2. CREATE (Crear un nuevo cliente)
// ------------------------------------------------
export async function createCliente(prevState: unknown, formData: FormData) {
    const validatedFields = ClienteSchema.safeParse({
        codigoCliente: formData.get('codigoCliente'),
        nombreCliente: formData.get('nombreCliente'),
        idVendedor: formData.get('idVendedor'),
        telefonoCliente: formData.get('telefonoCliente'),
        direccionCliente: formData.get('direccionCliente'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Error de validación',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const newCliente = validatedFields.data;

    const { error } = await supabase
        .from('cliente')
        .insert(newCliente);

    if (error) {
        return { message: 'Error al crear el cliente: ' + error.message };
    }

    // Refresca la ruta actual para actualizar la lista en el frontend
    revalidatePath('/clientes');
    return { message: '' }; // Éxito
}

// ------------------------------------------------
// 3. UPDATE (Actualizar un cliente existente)
// ------------------------------------------------
export async function updateCliente(prevState: unknown, formData: FormData) {
    const id = formData.get('idCliente') as string;

    const validatedFields = ClienteSchema.safeParse({
        codigoCliente: formData.get('codigoCliente'),
        nombreCliente: formData.get('nombreCliente'),
        idVendedor: formData.get('idVendedor'),
        telefonoCliente: formData.get('telefonoCliente'),
        direccionCliente: formData.get('direccionCliente'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Error de validación',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const updatedFields = validatedFields.data;

    const { error } = await supabase
        .from('cliente')
        .update(updatedFields)
        .eq('idCliente', Number(id));

    if (error) {
        return { message: 'Error al actualizar el cliente: ' + error.message };
    }

    revalidatePath('/clientes');
    return { message: '' }; // Éxito
}

// ------------------------------------------------
// 4. DELETE (Eliminar un cliente)
// ------------------------------------------------
export async function deleteCliente(id: number) {
    const { error } = await supabase
        .from('cliente')
        .delete()
        .eq('idCliente', id);

    if (error) {
        throw new Error('Error al eliminar el cliente: ' + error.message);
    }

    revalidatePath('/clientes');
}