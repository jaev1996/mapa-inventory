'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';
import { CobroSchema, AprobarCobroSchema } from '@/lib/schemas';
import { createClient } from '@supabase/supabase-js';

// Types
export type FacturaEstado = {
    codigoVenta: string;
    idVenta: number;
    fechaVenta: string;
    idCliente: number;
    idVendedor: number;
    tipoPago: string;
    estatusVenta: string;
    nombreCliente: string;
    telefonoCliente: string;
    direccionCliente: string;
    nombreVendedor: string;
    montoTotal: number;
    montoPagado: number;
    saldoPendiente: number;
    estatusPago: string;
};

export type Cobro = {
    idCobro: number;
    idVenta: number;
    monto: number;
    fechaPago: string;
    metodoPago: string;
    referencia?: string;
    comprobanteUrl?: string;
    estatus: 'pendiente' | 'confirmado' | 'rechazado';
    notas?: string;
    created_at: string;
    updated_at: string;
};

/**
 * Get all invoices with their payment status
 * @param filtro - Optional filter: 'pendiente', 'pagada', 'parcial'
 */
export async function getFacturasConEstado(filtro?: string) {
    let query = supabase
        .from('vista_estado_facturas')
        .select('*')
        .order('fechaVenta', { ascending: false });

    if (filtro) {
        switch (filtro) {
            case 'pendiente':
                query = query.eq('estatusPago', 'Pendiente');
                break;
            case 'pagada':
                query = query.eq('estatusPago', 'Pagada');
                break;
            case 'parcial':
                query = query.eq('estatusPago', 'Pago Parcial');
                break;
        }
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching facturas:', error.message, error.details, error.hint);
        return [];
    }

    return data as FacturaEstado[];
}

/**
 * Get invoice details by codigoVenta
 */
export async function getFacturaDetalle(codigoVenta: string) {
    const { data, error } = await supabase
        .from('vista_estado_facturas')
        .select('*')
        .eq('codigoVenta', codigoVenta)
        .single();

    if (error) {
        console.error('Error fetching factura:', error.message, error.details, error.hint);
        return null;
    }

    return data as FacturaEstado;
}

/**
 * Get all payments for a specific invoice
 */
export async function getCobrosDeFactura(codigoVenta: string) {
    const { data, error } = await supabase
        .from('cobros')
        .select('*')
        .eq('codigoVenta', codigoVenta)
        .order('fechaCobro', { ascending: false });

    if (error) {
        console.error('Error fetching cobros:', error);
        return [];
    }

    return data as Cobro[];
}

/**
 * Register a new payment (Cliente or Admin)
 * Validates that the payment amount doesn't exceed the pending balance
 */
export async function registrarPago(prevState: unknown, formData: FormData) {
    const rawData = {
        idVenta: formData.get('idVenta'),
        monto: formData.get('monto'),
        fechaPago: formData.get('fechaPago') || new Date().toISOString().split('T')[0],
        metodoPago: formData.get('metodoPago'),
        referencia: formData.get('referencia'),
        comprobanteUrl: formData.get('comprobanteUrl'),
        notas: formData.get('notas'),
    };

    // Validate payment data
    const validated = CobroSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            message: 'Error de validación',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    // Get current invoice status to validate balance
    // First get the venta to find codigoVenta
    const { data: venta, error: ventaError } = await supabase
        .from('ventas')
        .select('codigoVenta')
        .eq('idVenta', validated.data.idVenta)
        .single();

    if (ventaError || !venta) {
        return { message: 'Venta no encontrada' };
    }

    const factura = await getFacturaDetalle(venta.codigoVenta);

    if (!factura) {
        return { message: 'Factura no encontrada' };
    }

    // Validate that payment doesn't exceed pending balance
    if (validated.data.monto > factura.saldoPendiente) {
        return {
            message: `El monto ingresado ($${validated.data.monto}) excede el saldo pendiente ($${factura.saldoPendiente})`,
        };
    }

    // Insert payment record
    const { error } = await supabase
        .from('cobros')
        .insert([{
            ...validated.data,
            estatus: 'pendiente', // Always starts as pending
        }]);

    if (error) {
        console.error('Error registering payment:', error);
        return { message: `Error al registrar el pago: ${error.message}` };
    }

    revalidatePath('/cobros');
    revalidatePath('/admin/cobros');
    return { message: 'success', data: 'Pago registrado exitosamente. Pendiente de aprobación.' };
}

/**
 * Upload payment receipt to Supabase Storage
 */
export async function subirComprobante(file: File, codigoVenta: string) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${codigoVenta}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Create a Supabase client with service role for storage operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const storageClient = createClient(supabaseUrl, supabaseKey);

        const { error } = await storageClient.storage
            .from('pagos')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading file:', error);
            return { error: error.message };
        }

        // Get public URL
        const { data: urlData } = storageClient.storage
            .from('pagos')
            .getPublicUrl(filePath);

        return { url: urlData.publicUrl };
    } catch (error) {
        console.error('Error in subirComprobante:', error);
        return { error: 'Error al subir el comprobante' };
    }
}

/**
 * Get all pending payments for admin approval
 */
export async function getPagosPendientes() {
    const { data, error } = await supabase
        .from('cobros')
        .select(`
            *,
            venta:ventas (
                codigoVenta,
                Cliente:cliente (nombreCliente)
            )
        `)
        .eq('estatus', 'pendiente')
        .order('fechaPago', { ascending: false });

    if (error) {
        console.error('Error fetching pending payments:', error);
        return [];
    }

    return data;
}

/**
 * Confirm or reject a payment (Admin only)
 */
export async function aprobarPago(prevState: unknown, formData: FormData) {
    const rawData = {
        idCobro: formData.get('idCobro'),
        accion: formData.get('accion'),
        observaciones: formData.get('observaciones'),
    };

    // Validate
    const validated = AprobarCobroSchema.safeParse(rawData);

    if (!validated.success) {
        return {
            message: 'Error de validación',
            errors: validated.error.flatten().fieldErrors,
        };
    }

    const nuevoEstatus = validated.data.accion === 'confirmar' ? 'confirmado' : 'rechazado';

    // Update payment status
    const { error } = await supabase
        .from('cobros')
        .update({
            estatus: nuevoEstatus,
            notas: validated.data.observaciones || null,
        })
        .eq('idCobro', validated.data.idCobro);

    if (error) {
        console.error('Error updating payment:', error);
        return { message: `Error al actualizar el pago: ${error.message}` };
    }

    // The trigger will automatically update the venta status if fully paid

    revalidatePath('/admin/cobros');
    revalidatePath('/cobros');
    return {
        message: 'success',
        data: `Pago ${nuevoEstatus} exitosamente`,
    };
}

/**
 * Get payment history for a client (by clienteId)
 */
export async function getHistorialPagosCliente(idCliente: number) {
    const { data, error } = await supabase
        .from('cobros')
        .select(`
            *,
            venta:ventas (
                codigoVenta,
                fechaVenta
            )
        `)
        .eq('venta.idCliente', idCliente)
        .order('fechaPago', { ascending: false });

    if (error) {
        console.error('Error fetching client payment history:', error);
        return [];
    }

    return data;
}
