'use server'

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { MarcaRepuesto, TipoRepuesto, Repuesto } from '@/lib/types';
import { MarcaSchema, TipoRepuestoSchema, RepuestoSchema } from '@/lib/schemas';

const SUPABASE_BUCKET = 'repuestos';

async function uploadImages(files: File[], codigoRep: string): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    // Prepare path: codigoRep/timestamp_filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `${codigoRep}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      // Continue with others or throw? Let's throw to stop incomplete inconsistencies if critical
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filePath);

    uploadedUrls.push(publicUrl);
  }

  return uploadedUrls;
}

async function deleteStorageImages(urls: string[]) {
  if (!urls || urls.length === 0) return;

  // Extract paths from URLs
  // Typical URL: https://xyz.supabase.co/storage/v1/object/public/repuestos/folder/file.jpg
  const pathsToDelete = urls.map(url => {
    try {
      const parts = url.split(`/${SUPABASE_BUCKET}/`);
      if (parts.length > 1) {
        // Decode URI component to handle spaces and special characters
        return decodeURIComponent(parts[1]);
      }
      return null;
    } catch (e) {
      console.error('Error parsing URL for deletion:', url, e);
      return null;
    }
  }).filter((path): path is string => path !== null);

  if (pathsToDelete.length > 0) {
    console.log('Attempting to delete files from storage:', pathsToDelete);
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .remove(pathsToDelete);

    if (error) {
      console.error('Error deleting files from storage:', error);
    } else {
      console.log('Successfully deleted files from storage');
    }
  }
}

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

export async function getRepuestos(page = 1, pageSize = 10, search = '', lowStock = false, tipo = '') {
  let query = supabase
    .from('repuestos')
    .select(`
      *,
      MarcaRepuesto:marcarepuesto (descripMarca),
      TipoRepuesto:tiporepuesto (descripTipo)
    `, { count: 'exact' })
    .order('codigoRep', { ascending: true }) // Changed to order by codigoRep
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.or(`descripRep.ilike.%${search}%,codigoRep.ilike.%${search}%`);
  }

  if (tipo && tipo !== 'all') {
    query = query.eq('idTipo', parseInt(tipo));
  }

  if (lowStock) {
    // Low stock logic: items with quantity <= 5
    // AND we still probably want to exclude 0 if the user said "available"? 
    // The requirement says "only seek spare parts that are available i.e. those that are in quantity 0 don't seek them".
    // But "show spare parts that are low on stock" might imply seeing 0s too?
    // Usually "Low Stock" includes 0. 
    // However, the prompt says "by default only seek spare parts that are available".
    // If I toggle "Low Stock", I probably Want to see 0s. 
    // Let's assume Low Stock overrides the "Available" rule to show critical items.
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

  // Handle Images
  const newFiles = formData.getAll('newImages') as File[];
  const validFiles = newFiles.filter(f => f.size > 0 && f.name !== 'undefined');

  // Validate max files (redundant check but safe)
  if (validFiles.length > 3) {
    return {
      message: 'Error de validación',
      errors: { imagenes: ['Máximo 3 imágenes permitidas.'] }
    };
  }

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

  const { error, data } = await supabase
    .from('repuestos')
    .insert([{
      codigoRep,
      descripRep,
      cantidadRep,
      precioRep,
      idMarca,
      idTipo,
      ubicRep,
      imagenes: []
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating repuesto:', error);
    if (error.code === '23505') {
      return {
        message: 'Error de validación',
        errors: { codigoRep: ['El código ya existe.'] },
      };
    }
    return { message: `Error al crear el repuesto: ${error.message}` };
  }

  // Upload Images if any
  if (validFiles.length > 0 && data) {
    try {
      const imageUrls = await uploadImages(validFiles, codigoRep);

      // Update with images
      await supabase
        .from('repuestos')
        .update({ imagenes: imageUrls })
        .eq('idRep', data.idRep);

    } catch (uploadError) {
      console.error('Error processing images:', uploadError);
    }
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

  // Handle Images
  // 1. Get existing images to keep
  const keepImagesJson = formData.get('keepImages') as string;
  const keepImages: string[] = keepImagesJson ? JSON.parse(keepImagesJson) : [];

  // 2. Get images to delete (from storage)
  const deleteImagesJson = formData.get('deleteImages') as string;
  const deleteImagesUrls: string[] = deleteImagesJson ? JSON.parse(deleteImagesJson) : [];

  // 3. New files
  const newFiles = formData.getAll('newImages') as File[];
  const validNewFiles = newFiles.filter(f => f.size > 0 && f.name !== 'undefined');

  // Validate total
  if (keepImages.length + validNewFiles.length > 3) {
    return {
      message: 'Error de validación',
      errors: { imagenes: ['Máximo 3 imágenes permitidas (existentes + nuevas).'] }
    };
  }

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

  try {
    // Process Deletions
    if (deleteImagesUrls.length > 0) {
      await deleteStorageImages(deleteImagesUrls);
    }

    // Process New Uploads
    let finalImages = [...keepImages];
    if (validNewFiles.length > 0) {
      const newUrls = await uploadImages(validNewFiles, codigoRep);
      finalImages = [...finalImages, ...newUrls];
    }

    const { error: imgUpdateError } = await supabase
      .from('repuestos')
      .update({ imagenes: finalImages })
      .eq('idRep', idRep);

    if (imgUpdateError) {
      console.error('Error updating images in DB:', imgUpdateError);
    }

  } catch (imgError) {
    console.error('Error handling images during update:', imgError);
  }

  revalidatePath('/inventario/repuestos');
  return { message: '' };
}

export async function deleteRepuesto(idRep: number) {
  const { error, data } = await supabase
    .from('repuestos')
    .delete()
    .eq('idRep', idRep)
    .select() // Select to get data for image cleanup
    .single();

  // We should also delete images from storage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!error && (data as any)?.imagenes && Array.isArray((data as any).imagenes)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagesToDelete = (data as any).imagenes as string[];
    if (imagesToDelete.length > 0) {
      // Fire and forget or await? Await is safer
      await deleteStorageImages(imagesToDelete);
    }
  }

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
