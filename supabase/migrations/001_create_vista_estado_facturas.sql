-- 1. Tabla de Cobros
CREATE TABLE IF NOT EXISTS cobros (
    "idCobro" SERIAL PRIMARY KEY,
    "idVenta" INTEGER NOT NULL REFERENCES ventas("idVenta"),
    "monto" NUMERIC(10, 2) NOT NULL,
    "fechaPago" DATE NOT NULL DEFAULT CURRENT_DATE,
    "metodoPago" TEXT NOT NULL, -- 'transferencia', 'efectivo', 'pago_movil'
    "referencia" TEXT, -- Número de comprobante
    "comprobanteUrl" TEXT, -- Link a Supabase Storage
    "estatus" TEXT NOT NULL DEFAULT 'pendiente' CHECK ("estatus" IN ('pendiente', 'confirmado', 'rechazado')),
    "notas" TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_cobros_id_venta ON cobros("idVenta");
CREATE INDEX IF NOT EXISTS idx_cobros_estatus ON cobros("estatus");

-- 2. Vista de Estado de Facturas (Versión Completa)
DROP VIEW IF EXISTS vista_estado_facturas;
CREATE VIEW vista_estado_facturas AS
SELECT 
    v."idVenta",
    v."codigoVenta",
    v."fechaVenta",
    v."idCliente",
    v."idVendedor",
    v."tipoPago",
    v."estatusVenta",
    c."nombreCliente",
    c."telefonoCliente",
    c."direccionCliente",
    vend."nombreVendedor",
    -- Monto Total
    COALESCE((
        SELECT SUM(hv."subtotalRep") 
        FROM historicoventas hv 
        WHERE hv."codigoVenta" = v."codigoVenta"
    ), 0) AS "montoTotal",
    -- Monto Pagado
    COALESCE((
        SELECT SUM(co."monto") 
        FROM cobros co 
        WHERE co."idVenta" = v."idVenta" 
        AND co."estatus" = 'confirmado'
    ), 0) AS "montoPagado",
    -- Saldo Pendiente
    COALESCE((
        SELECT SUM(hv."subtotalRep") 
        FROM historicoventas hv 
        WHERE hv."codigoVenta" = v."codigoVenta"
    ), 0) - COALESCE((
        SELECT SUM(co."monto") 
        FROM cobros co 
        WHERE co."idVenta" = v."idVenta" 
        AND co."estatus" = 'confirmado'
    ), 0) AS "saldoPendiente",
    -- Estatus de Pago
    CASE 
        WHEN COALESCE((
            SELECT SUM(hv."subtotalRep") 
            FROM historicoventas hv 
            WHERE hv."codigoVenta" = v."codigoVenta"
        ), 0) - COALESCE((
            SELECT SUM(co."monto") 
            FROM cobros co 
            WHERE co."idVenta" = v."idVenta" 
            AND co."estatus" = 'confirmado'
        ), 0) <= 0 THEN 'Pagada'
        WHEN COALESCE((
            SELECT SUM(co."monto") 
            FROM cobros co 
            WHERE co."idVenta" = v."idVenta" 
            AND co."estatus" = 'confirmado'
        ), 0) > 0 THEN 'Pago Parcial'
        ELSE 'Pendiente'
    END AS "estatusPago"
FROM ventas v
LEFT JOIN cliente c ON v."idCliente" = c."idCliente"
LEFT JOIN vendedor vend ON v."idVendedor" = vend."idVendedor";

-- 3. Trigger para actualizar automáticamente el estatus de la venta
CREATE OR REPLACE FUNCTION actualizar_estatus_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_total NUMERIC(10, 2);
    v_pagado NUMERIC(10, 2);
BEGIN
    IF NEW."estatus" = 'confirmado' THEN
        -- Obtener total de la vista (que ya tiene los cálculos)
        SELECT "montoTotal", "montoPagado" INTO v_total, v_pagado
        FROM vista_estado_facturas
        WHERE "idVenta" = NEW."idVenta";
        
        -- Si ya se pagó todo, marcar la venta como Pagada
        IF v_pagado >= v_total THEN
            UPDATE ventas
            SET "estatusVenta" = 'Pagada'
            WHERE "idVenta" = NEW."idVenta";
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_estatus_venta ON cobros;
CREATE TRIGGER trigger_actualizar_estatus_venta
    AFTER INSERT OR UPDATE ON cobros
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_estatus_venta();
