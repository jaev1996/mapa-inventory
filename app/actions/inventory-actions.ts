'use server'

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { MarcaRepuesto, TipoRepuesto, Repuesto } from '@/lib/types';
import { MarcaSchema, TipoRepuestoSchema, RepuestoSchema } from '@/lib/schemas';

// --- MarcaRepuesto Actions ---

export async function getMarcas(page = 1, pageSize = 10, search = '') {
  let query = supabase
    .from('marcarepuesto')
    .select('*', { count: 'exact' })
    .order('idMarca', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.ilike('descripMarca', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching marcas:', error);
    throw new Error(`Error fetching marcas: ${error.message}`);
  }

  return { data: data as MarcaRepuesto[], count };
}

export async function createMarca(prevState: unknown, formData: FormData) {
  const validatedFields = MarcaSchema.safeParse({
    descripMarca: formData.get('descripMarca'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { descripMarca } = validatedFields.data;

  const { error } = await supabase
    .from('marcarepuesto')
    .insert([{ descripMarca }]);

  if (error) {
    console.error('Error creating marca:', error);
    return { message: `Error al crear la marca: ${error.message}` };
  }

  revalidatePath('/inventario/marcas');
  return { message: '' };
}

export async function updateMarca(idMarca: number, prevState: unknown, formData: FormData) {
  const validatedFields = MarcaSchema.safeParse({
    descripMarca: formData.get('descripMarca'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { descripMarca } = validatedFields.data;

  const { error } = await supabase
    .from('marcarepuesto')
    .update({ descripMarca })
    .eq('idMarca', idMarca);

  if (error) {
    console.error('Error updating marca:', error);
    return { message: `Error al actualizar la marca: ${error.message}` };
  }

  revalidatePath('/inventario/marcas');
  return { message: '' };
}

export async function deleteMarca(idMarca: number) {
  const { error } = await supabase
    .from('marcarepuesto')
    .delete()
    .eq('idMarca', idMarca);

  if (error) {
    console.error('Error deleting marca:', error);
    throw new Error(`Error deleting marca: ${error.message}`);
  }

  revalidatePath('/inventario/marcas');
}

// --- TipoRepuesto Actions ---

export async function getTipos(page = 1, pageSize = 10, search = '') {
  let query = supabase
    .from('tiporepuesto')
    .select('*', { count: 'exact' })
    .order('idTipo', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.ilike('descripTipo', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching tipos:', error);
    throw new Error(`Error fetching tipos: ${error.message}`);
  }

  return { data: data as TipoRepuesto[], count };
}

export async function createTipo(prevState: unknown, formData: FormData) {
  const validatedFields = TipoRepuestoSchema.safeParse({
    descripTipo: formData.get('descripTipo'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { descripTipo } = validatedFields.data;

  const { error } = await supabase
    .from('tiporepuesto')
    .insert([{ descripTipo }]);

  if (error) {
    console.error('Error creating tipo:', error);
    return { message: `Error al crear el tipo: ${error.message}` };
  }

  revalidatePath('/inventario/tipos');
  return { message: '' };
}

export async function updateTipo(idTipo: number, prevState: unknown, formData: FormData) {
  const validatedFields = TipoRepuestoSchema.safeParse({
    descripTipo: formData.get('descripTipo'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { descripTipo } = validatedFields.data;

  const { error } = await supabase
    .from('tiporepuesto')
    .update({ descripTipo })
    .eq('idTipo', idTipo);

  if (error) {
    console.error('Error updating tipo:', error);
    return { message: `Error al actualizar el tipo: ${error.message}` };
  }

  revalidatePath('/inventario/tipos');
  return { message: '' };
}

export async function deleteTipo(idTipo: number) {
  const { error } = await supabase
    .from('tiporepuesto')
    .delete()
    .eq('idTipo', idTipo);

  if (error) {
    console.error('Error deleting tipo:', error);
    throw new Error(`Error deleting tipo: ${error.message}`);
  }

  revalidatePath('/inventario/tipos');
}

// --- Repuestos Actions ---

export async function getRepuestos(page = 1, pageSize = 10, search = '', lowStock = false) {
  let query = supabase
    .from('repuestos')
    .select(`
      *,
      MarcaRepuesto:marcarepuesto (descripMarca),
      TipoRepuesto:tiporepuesto (descripTipo)
    `, { count: 'exact' })
    .order('descripRep', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.or(`descripRep.ilike.%${search}%,codigoRep.ilike.%${search}%`);
  }

  if (lowStock) {
    // Low stock logic: items with quantity <= 5 (arbitrary threshold, adjust as needed)
    query = query.lte('cantidadRep', 5);
  } else {
    // Default behavior: exclude items with 0 stock
    query = query.gt('cantidadRep', 0);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching repuestos:', error);
    throw new Error(`Error fetching repuestos: ${error.message}`);
  }

  return { data: data as Repuesto[], count };
}

export async function createRepuesto(prevState: unknown, formData: FormData) {
  const validatedFields = RepuestoSchema.safeParse({
    codigoRep: formData.get('codigoRep'),
    descripRep: formData.get('descripRep'),
    cantidadRep: formData.get('cantidadRep'),
    precioRep: formData.get('precioRep'),
    idMarca: formData.get('idMarca'),
    idTipo: formData.get('idTipo'),
    ubicRep: formData.get('ubicRep'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { codigoRep, descripRep, cantidadRep, precioRep, idMarca, idTipo, ubicRep } = validatedFields.data;

  // Check for duplicate codigoRep
  const { data: existingRepuesto } = await supabase
    .from('repuestos')
    .select('idRep')
    .eq('codigoRep', codigoRep)
    .single();

  if (existingRepuesto) {
    return {
      message: 'Error de validación',
      errors: { codigoRep: ['El código ya existe.'] },
    };
  }

  const { error } = await supabase
    .from('repuestos')
    .insert([{
      codigoRep,
      descripRep,
      cantidadRep,
      precioRep,
      idMarca,
      idTipo,
      ubicRep
    }]);

  if (error) {
    console.error('Error creating repuesto:', error);
    // Handle unique constraint error specifically if race condition occurs
    if (error.code === '23505') { // Postgres unique_violation code
      return {
        message: 'Error de validación',
        errors: { codigoRep: ['El código ya existe.'] },
      };
    }
    return { message: `Error al crear el repuesto: ${error.message}` };
  }

  revalidatePath('/inventario/repuestos');
  return { message: '' };
}

export async function updateRepuesto(idRep: number, prevState: unknown, formData: FormData) {
  const validatedFields = RepuestoSchema.safeParse({
    codigoRep: formData.get('codigoRep'),
    descripRep: formData.get('descripRep'),
    cantidadRep: formData.get('cantidadRep'),
    precioRep: formData.get('precioRep'),
    idMarca: formData.get('idMarca'),
    idTipo: formData.get('idTipo'),
    ubicRep: formData.get('ubicRep'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Error de validación',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { codigoRep, descripRep, cantidadRep, precioRep, idMarca, idTipo, ubicRep } = validatedFields.data;

  // Check for duplicate codigoRep (excluding current item)
  const { data: existingRepuesto } = await supabase
    .from('repuestos')
    .select('idRep')
    .eq('codigoRep', codigoRep)
    .neq('idRep', idRep)
    .single();

  if (existingRepuesto) {
    return {
      message: 'Error de validación',
      errors: { codigoRep: ['El código ya existe.'] },
    };
  }

  const { error } = await supabase
    .from('repuestos')
    .update({
      codigoRep,
      descripRep,
      cantidadRep,
      precioRep,
      idMarca,
      idTipo,
      ubicRep
    })
    .eq('idRep', idRep);

  if (error) {
    console.error('Error updating repuesto:', error);
    if (error.code === '23505') {
      return {
        message: 'Error de validación',
        errors: { codigoRep: ['El código ya existe.'] },
      };
    }
    return { message: `Error al actualizar el repuesto: ${error.message}` };
  }

  revalidatePath('/inventario/repuestos');
  return { message: '' };
}

export async function deleteRepuesto(idRep: number) {
  const { error } = await supabase
    .from('repuestos')
    .delete()
    .eq('idRep', idRep);

  if (error) {
    console.error('Error deleting repuesto:', error);
    throw new Error(`Error deleting repuesto: ${error.message}`);
  }

  revalidatePath('/inventario/repuestos');
}

export async function getAllMarcas() {
  const { data, error } = await supabase.from('marcarepuesto').select('*').order('descripMarca');
  if (error) throw error;
  return data as MarcaRepuesto[];
}

export async function getAllTipos() {
  const { data, error } = await supabase.from('tiporepuesto').select('*').order('descripTipo');
  if (error) throw error;
  return data as TipoRepuesto[];
}
