import { z } from 'zod';

export const MarcaSchema = z.object({
    descripMarca: z.string().min(1, "La descripción es obligatoria"),
});

export const TipoRepuestoSchema = z.object({
    descripTipo: z.string().min(1, "La descripción es obligatoria"),
});

export const RepuestoSchema = z.object({
    codigoRep: z.string().min(1, "El código es obligatorio"),
    descripRep: z.string().min(1, "La descripción es obligatoria"),
    cantidadRep: z.coerce.number().min(0, "La cantidad debe ser mayor o igual a 0"),
    precioRep: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    idMarca: z.coerce.number().min(1, "Seleccione una marca"),
    idTipo: z.coerce.number().min(1, "Seleccione un tipo"),
    ubicRep: z.string().optional(),
});

export const ClienteSchema = z.object({
    codigoCliente: z.string().min(1, "El código es obligatorio"),
    nombreCliente: z.string().min(1, "El nombre es obligatorio"),
    telefonoCliente: z.string().min(1, "El teléfono es obligatorio"),
    direccionCliente: z.string().min(1, "La dirección es obligatoria"),
    idVendedor: z.coerce.number().min(1, "Seleccione un vendedor"),
});

export const VendedorSchema = z.object({
    codigoVendedor: z.string().min(1, "El código es obligatorio"),
    nombreVendedor: z.string().min(1, "El nombre es obligatorio"),
    telefonoVendedor: z.string().min(1, "El teléfono es obligatorio"),
});

export const VentaSchema = z.object({
    codigoVenta: z.string().min(1, "El código de venta es obligatorio"),
    idCliente: z.coerce.number().min(1, "Seleccione un cliente"),
    idVendedor: z.coerce.number().min(1, "Seleccione un vendedor"),
    tipoPago: z.string().min(1, "Seleccione un tipo de pago"),
    estatusVenta: z.string().min(1, "Estatus de venta requerido"),
    fechaVenta: z.string().optional(),
});

export const HistoricoVentaSchema = z.object({
    codigoVenta: z.string().min(1, "Código de venta requerido"),
    codigoRep: z.string().min(1, "Código de repuesto requerido"),
    cantidadRep: z.coerce.number().min(1, "La cantidad debe ser mayor a 0"),
    precioRep: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    subtotalRep: z.coerce.number().min(0, "El subtotal debe ser mayor o igual a 0"),
});
