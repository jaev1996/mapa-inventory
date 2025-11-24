'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { VentaSchema, HistoricoVentaSchema } from '@/lib/schemas';
// Removed unused imports

export async function getVentas() {
    const { data, error } = await supabase
        .from('ventas')
        .select(`
      *,
      Cliente:cliente (nombreCliente),
      Vendedor:vendedor (nombreVendedor)
    `)
        .order('idVenta', { ascending: false });

    if (error) {
        console.error('Error fetching ventas:', error);
        return [];
    }

    return data;
}

export async function getNextVentaId() {
    const { data, error } = await supabase
        .from('ventas')
        .select('codigoVenta')
        .order('idVenta', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching last venta:', error);
        return 'NE-0001'; // Fallback
    }

    if (!data || data.length === 0) {
        return 'NE-0001';
    }

    const lastCode = data[0].codigoVenta;
    const match = lastCode.match(/NE-(\d+)/);

    if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `NE-${nextNum.toString().padStart(4, '0')}`;
    }

    return 'NE-0001';
}

export async function createVenta(prevState: unknown, formData: FormData) {
    // Extract data from FormData
    // Note: Since we are likely sending a complex object (items), we might need to parse JSON from a hidden field
    // or expect the client to send structured data. 
    // For standard server actions with FormData, we usually handle simple fields.
    // However, for a shopping cart, it's often easier to pass the cart items as a JSON string.

    const rawData = {
        codigoVenta: formData.get('codigoVenta'),
        idCliente: formData.get('idCliente'),
        idVendedor: formData.get('idVendedor'),
        tipoPago: formData.get('tipoPago'),
        estatusVenta: 'Completada', // Default status
        items: formData.get('items') ? JSON.parse(formData.get('items') as string) : [],
    };

    // Validate Venta fields
    const validatedVenta = VentaSchema.safeParse({
        codigoVenta: rawData.codigoVenta,
        idCliente: rawData.idCliente,
        idVendedor: rawData.idVendedor,
        tipoPago: rawData.tipoPago,
        estatusVenta: rawData.estatusVenta,
    });

    if (!validatedVenta.success) {
        return {
            message: 'Error de validación en la venta',
            errors: validatedVenta.error.flatten().fieldErrors,
        };
    }

    const items = rawData.items;
    if (!items || items.length === 0) {
        return { message: 'No hay items en la nota de entrega.' };
    }

    // Validate Items and Check Stock
    for (const item of items) {
        // Inject codigoVenta for validation
        const itemWithCode = { ...item, codigoVenta: validatedVenta.data.codigoVenta };

        const validatedItem = HistoricoVentaSchema.safeParse(itemWithCode);
        if (!validatedItem.success) {
            console.error(`Validation error for item ${item.codigoRep}:`, validatedItem.error);
            return { message: `Error en item ${item.codigoRep}: Datos inválidos` };
        }

        // Check stock
        const { data: repuesto, error: stockError } = await supabase
            .from('repuestos')
            .select('cantidadRep, descripRep')
            .eq('codigoRep', item.codigoRep)
            .single();

        if (stockError || !repuesto) {
            return { message: `Error al verificar stock del repuesto ${item.codigoRep}` };
        }

        if (repuesto.cantidadRep < item.cantidadRep) {
            return { message: `Stock insuficiente para ${repuesto.descripRep}. Disponible: ${repuesto.cantidadRep}` };
        }
    }

    // Start "Transaction" (Sequential operations)
    // 1. Create Venta
    const { error: ventaError } = await supabase
        .from('ventas')
        .insert([validatedVenta.data]);

    if (ventaError) {
        console.error('Error creating venta:', ventaError);
        return { message: `Error al crear la venta: ${ventaError.message}` };
    }

    // 2. Create HistoricoVentas (Items) and Update Stock
    for (const item of items) {
        // Insert Historico
        const { error: histError } = await supabase
            .from('historicoventas')
            .insert([{
                codigoVenta: validatedVenta.data.codigoVenta,
                codigoRep: item.codigoRep,
                cantidadRep: item.cantidadRep,
                precioRep: item.precioRep,
                subtotalRep: item.subtotalRep
            }]);

        if (histError) {
            console.error(`Error adding item ${item.codigoRep} to history:`, histError);
            // In a real app, we might want to rollback here.
            // For now, we continue but log the error.
        }

        // Update Stock
        // We fetch current stock again to be safe or just decrement
        // RPC 'decrement_stock' would be better, but let's do a direct update for now
        const { data: currentRep } = await supabase
            .from('repuestos')
            .select('cantidadRep')
            .eq('codigoRep', item.codigoRep)
            .single();

        if (currentRep) {
            await supabase
                .from('repuestos')
                .update({ cantidadRep: currentRep.cantidadRep - item.cantidadRep })
                .eq('codigoRep', item.codigoRep);
        }
    }

    revalidatePath('/ventas');
    revalidatePath('/inventario/repuestos');
    return { message: 'success' };
}

export async function getVentaDetails(codigoVenta: string) {
    // Fetch venta main record
    const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .select(`
            *,
            Cliente:cliente (nombreCliente, direccionCliente, telefonoCliente, codigoCliente),
            Vendedor:vendedor (nombreVendedor, codigoVendedor, telefonoVendedor)
        `)
        .eq('codigoVenta', codigoVenta)
        .single();

    if (ventaError || !venta) {
        console.error('Error fetching venta:', ventaError);
        return null;
    }

    // Fetch items from historicoventas
    const { data: items, error: itemsError } = await supabase
        .from('historicoventas')
        .select(`
            *,
            Repuesto:repuestos (descripRep)
        `)
        .eq('codigoVenta', codigoVenta);

    if (itemsError) {
        console.error('Error fetching venta items:', itemsError);
        return { ...venta, items: [] };
    }

    return { ...venta, items: items || [] };
}
