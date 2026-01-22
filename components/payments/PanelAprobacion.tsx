'use client';

import { useState, useEffect, useActionState } from 'react';
import { aprobarPago } from '@/app/actions/payment-actions';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Eye, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

type PagoPendiente = {
    idCobro: number;
    idVenta: number;
    monto: number;
    fechaPago: string;
    metodoPago: string;
    referencia?: string;
    comprobanteUrl?: string;
    notas?: string;
    estatus: string;
    created_at: string;
    venta?: {
        codigoVenta: string;
        Cliente?: {
            nombreCliente: string;
        };
    };
};

type PanelAprobacionProps = {
    pagosPendientes: PagoPendiente[];
};

const initialState: { message: string; data?: string } = {
    message: '',
};

export function PanelAprobacion({ pagosPendientes }: PanelAprobacionProps) {
    const [selectedPago, setSelectedPago] = useState<PagoPendiente | null>(null);
    const [accion, setAccion] = useState<'confirmar' | 'rechazar' | null>(null);
    const [observaciones, setObservaciones] = useState('');
    const [state, formAction] = useActionState(aprobarPago, initialState);
    const [showDialog, setShowDialog] = useState(false);
    const [showComprobanteDialog, setShowComprobanteDialog] = useState(false);
    const { toast } = useToast();

    // Handle form submission success
    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: 'Pago actualizado',
                description: state.data || 'El pago ha sido procesado exitosamente',
                variant: 'default',
            });
            // Use setTimeout to avoid cascading renders
            setTimeout(() => {
                setShowDialog(false);
                setSelectedPago(null);
                setAccion(null);
                setObservaciones('');
            }, 0);
        } else if (state?.message && state.message !== '') {
            toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive',
            });
        }
    }, [state, toast]);

    const handleAccion = (pago: PagoPendiente, accionType: 'confirmar' | 'rechazar') => {
        setSelectedPago(pago);
        setAccion(accionType);
        setShowDialog(true);
    };

    const handleVerComprobante = (pago: PagoPendiente) => {
        setSelectedPago(pago);
        setShowComprobanteDialog(true);
    };

    return (
        <>
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Código Venta</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                                <TableHead>Fecha Pago</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Referencia</TableHead>
                                <TableHead>Comprobante</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pagosPendientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        No hay pagos pendientes de aprobación
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagosPendientes.map((pago) => (
                                    <TableRow key={pago.idCobro}>
                                        <TableCell className="font-medium">#{pago.idCobro}</TableCell>
                                        <TableCell>{pago.venta?.codigoVenta || 'N/A'}</TableCell>
                                        <TableCell>
                                            {pago.venta?.Cliente?.nombreCliente || 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${pago.monto.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(pago.fechaPago).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{pago.metodoPago}</Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate">
                                            {pago.referencia || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {pago.comprobanteUrl ? (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleVerComprobante(pago)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">Sin comprobante</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => handleAccion(pago, 'confirmar')}
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Confirmar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAccion(pago, 'rechazar')}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Rechazar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {accion === 'confirmar' ? 'Confirmar Pago' : 'Rechazar Pago'}
                        </DialogTitle>
                        <DialogDescription>
                            {accion === 'confirmar'
                                ? 'Al confirmar, el monto se sumará al total pagado de la factura.'
                                : 'Al rechazar, el pago será marcado como rechazado y no se aplicará a la factura.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPago && (
                        <div className="space-y-4">
                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <p className="text-sm">
                                    <span className="font-semibold">Factura:</span> {selectedPago.venta?.codigoVenta}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Monto:</span> ${selectedPago.monto.toFixed(2)}
                                </p>
                                <p className="text-sm">
                                    <span className="font-semibold">Método:</span> {selectedPago.metodoPago}
                                </p>
                                {selectedPago.referencia && (
                                    <p className="text-sm">
                                        <span className="font-semibold">Referencia:</span> {selectedPago.referencia}
                                    </p>
                                )}
                            </div>

                            <form action={formAction} className="space-y-4">
                                <input type="hidden" name="idCobro" value={selectedPago.idCobro} />
                                <input type="hidden" name="accion" value={accion || ''} />

                                <div className="space-y-2">
                                    <Label htmlFor="observaciones">
                                        Observaciones {accion === 'rechazar' && <span className="text-red-500">*</span>}
                                    </Label>
                                    <Textarea
                                        id="observaciones"
                                        name="observaciones"
                                        value={observaciones}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservaciones(e.target.value)}
                                        placeholder={
                                            accion === 'rechazar'
                                                ? 'Indique el motivo del rechazo...'
                                                : 'Notas adicionales (opcional)...'
                                        }
                                        rows={3}
                                        required={accion === 'rechazar'}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant={accion === 'confirmar' ? 'default' : 'destructive'}
                                    >
                                        {accion === 'confirmar' ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Confirmar Pago
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Rechazar Pago
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Comprobante Dialog */}
            <Dialog open={showComprobanteDialog} onOpenChange={setShowComprobanteDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Comprobante de Pago</DialogTitle>
                        <DialogDescription>
                            Pago #{selectedPago?.idCobro} - {selectedPago?.venta?.codigoVenta}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPago?.comprobanteUrl && (
                        <div className="space-y-4">
                            <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
                                {selectedPago.comprobanteUrl.endsWith('.pdf') ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <p className="text-muted-foreground">Archivo PDF</p>
                                        <Button asChild>
                                            <a
                                                href={selectedPago.comprobanteUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Abrir PDF
                                            </a>
                                        </Button>
                                    </div>
                                ) : (
                                    <Image
                                        src={selectedPago.comprobanteUrl}
                                        alt="Comprobante de pago"
                                        fill
                                        className="object-contain"
                                    />
                                )}
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <a
                                    href={selectedPago.comprobanteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Abrir en nueva pestaña
                                </a>
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
