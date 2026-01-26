'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { Cobro, getCobrosDeVenta, updateCobro, deleteCobro, FacturaEstado } from '@/app/actions/payment-actions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeleteConfirmation } from '@/components/inventory/DeleteConfirmation';

interface VentasPagosDialogProps {
    factura: FacturaEstado;
    trigger?: React.ReactNode;
}

export function VentasPagosDialog({ factura, trigger }: VentasPagosDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cobros, setCobros] = useState<Cobro[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedData, setEditedData] = useState<Partial<Cobro>>({});

    // Delete Confirmation State
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Cobro | null>(null);

    const loadCobros = async () => {
        setLoading(true);
        try {
            const data = await getCobrosDeVenta(factura.idVenta);
            setCobros(data);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar los pagos');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (open) {
            loadCobros();
        }
    };

    const startEdit = (cobro: Cobro) => {
        setEditingId(cobro.idCobro);
        setEditedData({
            monto: cobro.monto,
            fechaPago: cobro.fechaPago,
            metodoPago: cobro.metodoPago,
            referencia: cobro.referencia || '',
            notas: cobro.notas || '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditedData({});
    };

    const saveEdit = async (idCobro: number) => {
        if (!editedData.monto || editedData.monto <= 0) {
            toast.error('El monto debe ser mayor a 0');
            return;
        }

        try {
            const res = await updateCobro(idCobro, editedData);
            if (res.error) {
                toast.error(`Error: ${res.error}`);
            } else {
                toast.success('Pago actualizado');
                setEditingId(null);
                loadCobros(); // Reload list
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar');
        }
    };

    const confirmDelete = (cobro: Cobro) => {
        setItemToDelete(cobro);
        setDeleteId(cobro.idCobro);
    };

    const executeDelete = async () => {
        if (deleteId) {
            const res = await deleteCobro(deleteId);
            if (res.error) {
                toast.error(`Error: ${res.error}`);
            } else {
                toast.success('Pago eliminado');
                setDeleteId(null);
                setItemToDelete(null);
                loadCobros();
            }
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[90vw] max-h-[85vh] overflow-y-auto w-full">
                    <DialogHeader>
                        <DialogTitle>Historial de Pagos - Venta #{factura.codigoVenta}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                                <p className="font-semibold">{factura.nombreCliente}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Monto Total</p>
                                <p className="font-semibold">${factura.montoTotal.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Saldo Pendiente</p>
                                <p className="font-semibold text-orange-600">${factura.saldoPendiente.toFixed(2)}</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Monto</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead>Referencia</TableHead>
                                            <TableHead>Notas</TableHead>
                                            <TableHead>Estatus</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cobros.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No hay pagos registrados para esta venta
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            cobros.map((cobro) => (
                                                <TableRow key={cobro.idCobro}>
                                                    {editingId === cobro.idCobro ? (
                                                        // Editing Row
                                                        <>
                                                            <TableCell>
                                                                <Input
                                                                    type="date"
                                                                    value={editedData.fechaPago ? new Date(editedData.fechaPago).toISOString().split('T')[0] : ''}
                                                                    onChange={(e) => setEditedData({ ...editedData, fechaPago: e.target.value })}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    type="number"
                                                                    value={editedData.monto}
                                                                    onChange={(e) => setEditedData({ ...editedData, monto: parseFloat(e.target.value) })}
                                                                    className="w-24"
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Select
                                                                    value={editedData.metodoPago}
                                                                    onValueChange={(val) => setEditedData({ ...editedData, metodoPago: val })}
                                                                >
                                                                    <SelectTrigger className="w-[140px]">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                                                                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                                                                        <SelectItem value="Pago Movil">Pago Móvil</SelectItem>
                                                                        <SelectItem value="Zelle">Zelle</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    value={editedData.referencia || ''}
                                                                    onChange={(e) => setEditedData({ ...editedData, referencia: e.target.value })}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <Input
                                                                    value={editedData.notas || ''}
                                                                    onChange={(e) => setEditedData({ ...editedData, notas: e.target.value })}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-sm text-muted-foreground">{cobro.estatus}</span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => saveEdit(cobro.idCobro)}>
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={cancelEdit}>
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    ) : (
                                                        // Display Row
                                                        <>
                                                            <TableCell>{cobro.fechaPago ? format(new Date(cobro.fechaPago), 'dd/MM/yyyy') : '-'}</TableCell>
                                                            <TableCell>${cobro.monto.toFixed(2)}</TableCell>
                                                            <TableCell>{cobro.metodoPago}</TableCell>
                                                            <TableCell>{cobro.referencia || '-'}</TableCell>
                                                            <TableCell className="max-w-[150px] truncate" title={cobro.notas || ''}>{cobro.notas || '-'}</TableCell>
                                                            <TableCell>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${cobro.estatus === 'confirmado' ? 'bg-green-100 text-green-700' :
                                                                    cobro.estatus === 'rechazado' ? 'bg-red-100 text-red-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                                    }`}>
                                                                    {cobro.estatus}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <div className="flex justify-end gap-2">
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(cobro)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => confirmDelete(cobro)}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </>
                                                    )}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <DeleteConfirmation
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={executeDelete}
                title="Eliminar Pago"
                description={`¿Estás seguro de que deseas eliminar este pago de $${itemToDelete?.monto}? Esta acción no se puede deshacer.`}
            />
        </>
    );
}
