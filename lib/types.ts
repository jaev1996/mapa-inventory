export interface MarcaRepuesto {
    idMarca: number;
    descripMarca: string;
}

export interface TipoRepuesto {
    idTipo: number;
    descripTipo: string;
}

export interface Repuesto {
    idRep: number;
    codigoRep: string;
    descripRep: string;
    cantidadRep: number;
    precioRep: number;
    idMarca: number;
    idTipo: number;
    ubicRep: string;
    // Joined fields for display
    MarcaRepuesto?: MarcaRepuesto;
    TipoRepuesto?: TipoRepuesto;
}

export interface Venta {
    idVenta: number;
    codigoVenta: string;
    idCliente: number;
    idVendedor: number;
    tipoPago: string;
    estatusVenta: string;
    fechaVenta: string;
}

export interface HistoricoVenta {
    idHistorico: number;
    codigoVenta: string;
    codigoRep: string;
    cantidadRep: number;
    precioRep: number;
    subtotalRep: number;
}
