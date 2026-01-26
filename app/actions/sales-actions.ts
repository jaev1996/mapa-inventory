'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { VentaSchema, HistoricoVentaSchema } from '@/lib/schemas';
// Removed unused imports

export interface VentasFilters {
    idCliente?: string;
    idVendedor?: string;
    startDate?: string;
    endDate?: string;
    codigoVenta?: string;
}

export async function getVentas(filters?: VentasFilters, page = 1, pageSize = 10) {
    let query = supabase
        .from('ventas')
        .select(`
            *,
            Cliente:cliente (nombreCliente),
            Vendedor:vendedor (nombreVendedor)
        `, { count: 'exact' });

    if (filters?.idCliente && filters.idCliente !== 'all') {
        query = query.eq('idCliente', filters.idCliente);
    }

    if (filters?.idVendedor && filters.idVendedor !== 'all') {
        query = query.eq('idVendedor', filters.idVendedor);
    }

    if (filters?.codigoVenta) {
        query = query.ilike('codigoVenta', `%${filters.codigoVenta}%`);
    }

    if (filters?.startDate) {
        // Assuming fechaVenta is a timestamp or date string
        query = query.gte('fechaVenta', `${filters.startDate}T00:00:00`);
    }

    if (filters?.endDate) {
        query = query.lte('fechaVenta', `${filters.endDate}T23:59:59`);
    }

    const { data, count, error } = await query
        .order('idVenta', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
        console.error('Error fetching ventas:', error);
        return { data: [], count: 0 };
    }

    return { data, count };
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

/**
 * Audit Helper
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function logAuditEvent(idVenta: number, user: string, accion: string, detalles: any) {
    await supabase.from('auditoria_ventas').insert([{
        idVenta,
        usuario: user, // In real app, fetch from auth
        accion,
        detalles,
    }]);
}

/**
 * Update Venta (Header and Items)
 * Handles stock adjustments and audit logging.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateVenta(idVenta: number, newData: any, userId: string = 'system') {
    // 1. Fetch current state
    const { data: currentVenta } = await supabase
        .from('ventas')
        .select('*')
        .eq('idVenta', idVenta)
        .single();

    if (!currentVenta) return { error: 'Venta no encontrada' };

    const { data: currentItems } = await supabase
        .from('historicoventas')
        .select('*')
        .eq('codigoVenta', currentVenta.codigoVenta);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const oldItemsMap = new Map<string, any>((currentItems || []).map((i: any) => [i.codigoRep, i]));
    const newItems = newData.items || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newItemsMap = new Map<string, any>(newItems.map((i: any) => [i.codigoRep, i]));

    // 2. Update Header
    if (newData.idCliente !== currentVenta.idCliente || newData.idVendedor !== currentVenta.idVendedor) {
        await supabase.from('ventas').update({
            idCliente: newData.idCliente,
            idVendedor: newData.idVendedor,
            estatusVenta: newData.estatusVenta
        }).eq('idVenta', idVenta);

        await logAuditEvent(idVenta, userId, 'EDICION_HEADER', {
            old: { idCliente: currentVenta.idCliente, idVendedor: currentVenta.idVendedor },
            new: { idCliente: newData.idCliente, idVendedor: newData.idVendedor }
        });
    }

    // 3. Process Items
    // A. Removed Items (In Old but not in New) -> Return Stock
    for (const [code, item] of oldItemsMap) {
        if (!newItemsMap.has(code)) {
            // Restore Stock
            const { data: rep } = await supabase.from('repuestos').select('cantidadRep').eq('codigoRep', code).single();
            if (rep) {
                await supabase.from('repuestos').update({ cantidadRep: rep.cantidadRep + item.cantidadRep }).eq('codigoRep', code);
            }
            // Delete Item
            await supabase.from('historicoventas').delete().eq('idHistorico', item.idHistorico); // Assuming pk exists or use match
            // Fallback match
            await supabase.from('historicoventas').delete()
                .eq('codigoVenta', currentVenta.codigoVenta)
                .eq('codigoRep', code);

            await logAuditEvent(idVenta, userId, 'REMOVER_ITEM', { item: code, qtyRestored: item.cantidadRep });
        }
    }

    // B. Added Items (In New but not in Old) -> Consume Stock
    for (const [code, item] of newItemsMap) {
        if (!oldItemsMap.has(code)) {
            // Consume Stock
            const { data: rep } = await supabase.from('repuestos').select('cantidadRep').eq('codigoRep', code).single();
            if (!rep || rep.cantidadRep < item.cantidadRep) {
                return { error: `Stock insuficiente para agregar ${code}` }; // Abort specific item? or Fail?
                // For simplicity, we fail. In robust app, better validation before.
            }
            await supabase.from('repuestos').update({ cantidadRep: rep.cantidadRep - item.cantidadRep }).eq('codigoRep', code);

            // Insert Item
            await supabase.from('historicoventas').insert([{
                codigoVenta: currentVenta.codigoVenta,
                codigoRep: code,
                cantidadRep: item.cantidadRep,
                precioRep: item.precioRep,
                subtotalRep: item.subtotalRep
            }]);

            await logAuditEvent(idVenta, userId, 'AGREGAR_ITEM', { item: code, qtyConsumed: item.cantidadRep });
        }
    }

    // C. Modified Items (In Both, Qty Changed)
    for (const [code, newItem] of newItemsMap) {
        if (oldItemsMap.has(code)) {
            const oldItem = oldItemsMap.get(code);
            const qtyDiff = newItem.cantidadRep - oldItem.cantidadRep;

            if (qtyDiff !== 0) {
                const { data: rep } = await supabase.from('repuestos').select('cantidadRep').eq('codigoRep', code).single();
                if (!rep) continue;

                if (qtyDiff > 0) {
                    // Increased Qty -> Check Stock -> Consume
                    if (rep.cantidadRep < qtyDiff) return { error: `Stock insuficiente para aumentar ${code}` };
                    await supabase.from('repuestos').update({ cantidadRep: rep.cantidadRep - qtyDiff }).eq('codigoRep', code);
                } else {
                    // Decreased Qty -> Restore Stock
                    // qtyDiff is negative, so -qtyDiff is positive
                    await supabase.from('repuestos').update({ cantidadRep: rep.cantidadRep - qtyDiff }).eq('codigoRep', code);
                }

                // Update Item
                await supabase.from('historicoventas').update({
                    cantidadRep: newItem.cantidadRep,
                    subtotalRep: newItem.subtotalRep
                }).eq('idHistorico', oldItem.idHistorico); // or match code/venta

                await logAuditEvent(idVenta, userId, 'CAMBIO_CANTIDAD', { item: code, oldQty: oldItem.cantidadRep, newQty: newItem.cantidadRep });
            }
        }
    }

    revalidatePath('/admin/dashboard/ventas');
    revalidatePath(`/admin/dashboard/ventas/${currentVenta.codigoVenta}`);
    return { success: true };
}
