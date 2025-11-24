// app/vendedores/actions.ts
'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { VendedorSchema } from '@/lib/schemas';

// Definición de tipos para el Vendedor
export interface Vendedor {
    idVendedor: number;
    codigoVendedor: string;
    nombreVendedor: string;
    telefonoVendedor: string;
}

// 1. READ (Leer todos los vendedores)
export async function getVendedores(): Promise<Vendedor[]> {
    const { data, error } = await supabase
        .from('vendedor')
        .select('*')
        .order('nombreVendedor', { ascending: true });

    if (error) {
        console.error('Error al obtener vendedores:', error);
        return [];
    }

    return data as Vendedor[];
}

// 2. CREATE (Crear un nuevo vendedor)
export async function createVendedor(prevState: unknown, formData: FormData) {
    const validatedFields = VendedorSchema.safeParse({
        codigoVendedor: formData.get('codigoVendedor'),
        nombreVendedor: formData.get('nombreVendedor'),
        telefonoVendedor: formData.get('telefonoVendedor'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Error de validación',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const newVendedor = validatedFields.data;

    const { error } = await supabase
        .from('vendedor')
        .insert(newVendedor);

    if (error) {
        return { message: 'Error al crear el vendedor: ' + error.message };
    }

    revalidatePath('/vendedores');
    revalidatePath('/clientes'); // Revalidamos clientes por si el formulario de clientes necesita la nueva lista
    return { message: '' }; // Éxito
}

// 3. UPDATE (Actualizar un vendedor existente)
export async function updateVendedor(prevState: unknown, formData: FormData) {
    const id = formData.get('idVendedor') as string;

    const validatedFields = VendedorSchema.safeParse({
        codigoVendedor: formData.get('codigoVendedor'),
        nombreVendedor: formData.get('nombreVendedor'),
        telefonoVendedor: formData.get('telefonoVendedor'),
    });

    if (!validatedFields.success) {
        return {
            message: 'Error de validación',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const updatedFields = validatedFields.data;

    const { error } = await supabase
        .from('vendedor')
        .update(updatedFields)
        .eq('idVendedor', Number(id));

    if (error) {
        return { message: 'Error al actualizar el vendedor: ' + error.message };
    }

    revalidatePath('/vendedores');
    revalidatePath('/clientes');
    return { message: '' }; // Éxito
}

// 4. DELETE (Eliminar un vendedor)
export async function deleteVendedor(id: number) {
    const { error } = await supabase
        .from('vendedor')
        .delete()
        .eq('idVendedor', id);

    if (error) {
        // Podríamos verificar si el error es por una foreign key constraint
        if (error.code === '23503') { // Código de error de PostgreSQL para foreign key violation
            throw new Error('No se puede eliminar el vendedor porque tiene clientes asociados.');
        }
        throw new Error('Error al eliminar el vendedor: ' + error.message);
    }

    revalidatePath('/vendedores');
    revalidatePath('/clientes');
}
