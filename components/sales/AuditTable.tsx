'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Eye, History, User, FileText, CheckCircle2, AlertCircle, Trash2, Edit3, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";

interface AuditLog {
    idAuditoria: number;
    idVenta: number;
    usuario: string;
    accion: string;
    detalles: any;
    observaciones?: string;
    fecha: string;
    Venta?: { codigoVenta: string };
}

interface AuditTableProps {
    logs: AuditLog[];
}

export function AuditTable({ logs }: AuditTableProps) {
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const getActionBadge = (accion: string) => {
        switch (accion) {
            case 'EDICION_HEADER':
                return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">Edición Cabecera</Badge>;
            case 'AGREGAR_ITEM':
                return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">Producto Agregado</Badge>;
            case 'REMOVER_ITEM':
                return <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">Producto Eliminado</Badge>;
            case 'CAMBIO_CANTIDAD':
                return <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-50">Cambio de Cantidad</Badge>;
            default:
                return <Badge variant="secondary">{accion}</Badge>;
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[180px]">Fecha y Hora</TableHead>
                        <TableHead>Nro. Entrega</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead className="text-right">Detalles</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                No se encontraron registros de auditoría.
                            </TableCell>
                        </TableRow>
                    ) : (
                        logs.map((log) => (
                            <TableRow key={log.idAuditoria} className="hover:bg-muted/30 transition-colors">
                                <TableCell className="font-medium text-xs">
                                    {format(new Date(log.fecha), "PPP p", { locale: es })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold">{log.Venta?.codigoVenta || `ID: ${log.idVenta}`}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{log.usuario || 'Sistema'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getActionBadge(log.accion)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedLog(log)}
                                        className="h-8 w-8 p-0"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-blue-600" />
                            Detalles de la Auditoría
                        </DialogTitle>
                        <DialogDescription>
                            Registro detallado del cambio realizado en la nota de entrega.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-muted">
                                <div>
                                    <p className="text-muted-foreground">Fecha:</p>
                                    <p className="font-medium">{format(new Date(selectedLog.fecha), "PPP p", { locale: es })}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Usuario:</p>
                                    <p className="font-medium">{selectedLog.usuario || 'Sistema'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Nota de Entrega:</p>
                                    <p className="font-medium">{selectedLog.Venta?.codigoVenta || selectedLog.idVenta}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Acción:</p>
                                    <div className="pt-1">{getActionBadge(selectedLog.accion)}</div>
                                </div>
                            </div>

                            {selectedLog.observaciones && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                                    <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-2 mb-1">
                                        <FileText className="h-4 w-4" />
                                        Observaciones del Administrador
                                    </h4>
                                    <p className="text-sm text-amber-700 italic">
                                        &ldquo;{selectedLog.observaciones}&rdquo;
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-blue-600" />
                                    Resumen de Cambios
                                </h4>
                                <div className="bg-white border rounded-lg overflow-hidden">
                                    {renderFriendlyDetails(selectedLog)}
                                </div>
                            </div>

                            <div className="rounded-md border bg-zinc-950 p-4 overflow-auto max-h-[300px]">
                                <h4 className="text-sm font-medium text-zinc-400 mb-2 border-b border-zinc-800 pb-2">Información Técnica del Cambio (JSON)</h4>
                                <pre className="text-xs text-zinc-300 font-mono">
                                    {JSON.stringify(selectedLog.detalles, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function renderFriendlyDetails(log: AuditLog) {
    const { accion, detalles } = log;

    switch (accion) {
        case 'EDICION_HEADER':
            return (
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-1">
                        <Edit3 className="h-4 w-4" />
                        Modificación de Datos Generales
                    </div>
                    {detalles.old.idCliente !== detalles.new.idCliente && (
                        <div className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                            <span className="text-muted-foreground">Cliente</span>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{detalles.old.idCliente}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono font-bold">{detalles.new.idCliente}</span>
                            </div>
                        </div>
                    )}
                    {detalles.old.idVendedor !== detalles.new.idVendedor && (
                        <div className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                            <span className="text-muted-foreground">Vendedor</span>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono">{detalles.old.idVendedor}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-mono font-bold">{detalles.new.idVendedor}</span>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'AGREGAR_ITEM':
            return (
                <div className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Se agregó un nuevo producto</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Producto: <span className="font-mono font-bold text-foreground">{detalles.item}</span> | Cantidad: <span className="font-bold text-foreground">{detalles.qtyConsumed}</span>
                        </p>
                    </div>
                </div>
            );

        case 'REMOVER_ITEM':
            return (
                <div className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                        <Trash2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Se eliminó un producto de la nota</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Producto: <span className="font-mono font-bold text-foreground">{detalles.item}</span> | Cantidad reintegrada: <span className="font-bold text-foreground">{detalles.qtyRestored}</span>
                        </p>
                    </div>
                </div>
            );

        case 'CAMBIO_CANTIDAD':
            return (
                <div className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Ajuste de cantidad</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="line-through text-muted-foreground">{detalles.oldQty}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{detalles.newQty}</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Producto: <span className="font-mono font-bold text-foreground">{detalles.item}</span>
                        </p>
                    </div>
                </div>
            );

        default:
            return (
                <div className="p-4 text-sm text-muted-foreground italic">
                    Visualización amigable no disponible para esta acción.
                </div>
            );
    }
}
