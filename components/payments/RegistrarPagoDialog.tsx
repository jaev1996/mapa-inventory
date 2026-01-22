'use client';

import { useState, useEffect, useActionState } from 'react';
import { registrarPago, subirComprobante, type FacturaEstado } from '@/app/actions/payment-actions';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RegistrarPagoDialogProps = {
    factura: FacturaEstado;
    trigger?: React.ReactNode;
};

type FormState = {
    message: string;
    data?: string;
    errors?: Record<string, string[]>;
};

const initialState: FormState = {
    message: '',
};

export function RegistrarPagoDialog({ factura, trigger }: RegistrarPagoDialogProps) {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState<FormState, FormData>(registrarPago, initialState);
    const [monto, setMonto] = useState('');
    const [uploading, setUploading] = useState(false);
    const [comprobanteUrl, setComprobanteUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    // Handle form submission success
    useEffect(() => {
        if (state?.message === 'success') {
            toast({
                title: 'Pago registrado',
                description: state.data || 'El pago ha sido registrado exitosamente',
                variant: 'default',
            });
            setOpen(false);
            // Reset form
            setMonto('');
            setComprobanteUrl('');
            setSelectedFile(null);
        } else if (state?.message && state.message !== '') {
            toast({
                title: 'Error',
                description: state.message,
                variant: 'destructive',
            });
        }
    }, [state, toast]);

    // Validate amount doesn't exceed pending balance
    const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = parseFloat(value);

        if (numValue > factura.saldoPendiente) {
            toast({
                title: 'Monto inválido',
                description: `El monto no puede exceder el saldo pendiente de $${factura.saldoPendiente.toFixed(2)}`,
                variant: 'destructive',
            });
            return;
        }

        setMonto(value);
    };

    // Handle file upload
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: 'Archivo muy grande',
                description: 'El archivo no debe superar los 5MB',
                variant: 'destructive',
            });
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            toast({
                title: 'Tipo de archivo inválido',
                description: 'Solo se permiten imágenes (JPG, PNG) o PDF',
                variant: 'destructive',
            });
            return;
        }

        setSelectedFile(file);
        setUploading(true);

        try {
            const result = await subirComprobante(file, factura.codigoVenta);
            if (result.error) {
                toast({
                    title: 'Error al subir archivo',
                    description: result.error,
                    variant: 'destructive',
                });
                setSelectedFile(null);
            } else if (result.url) {
                setComprobanteUrl(result.url);
                toast({
                    title: 'Archivo subido',
                    description: 'El comprobante ha sido cargado exitosamente',
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: 'Error',
                description: 'Error al subir el comprobante',
                variant: 'destructive',
            });
            setSelectedFile(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" variant="default">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Registrar Pago
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Pago</DialogTitle>
                    <DialogDescription>
                        Factura: {factura.codigoVenta} | Saldo Pendiente: ${factura.saldoPendiente.toFixed(2)}
                    </DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-4">
                    {/* Hidden fields */}
                    <input type="hidden" name="idVenta" value={factura.idVenta} />
                    <input type="hidden" name="comprobanteUrl" value={comprobanteUrl} />

                    {/* Monto */}
                    <div className="space-y-2">
                        <Label htmlFor="monto">
                            Monto a Pagar <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="monto"
                            name="monto"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={factura.saldoPendiente}
                            value={monto}
                            onChange={handleMontoChange}
                            placeholder="0.00"
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Máximo: ${factura.saldoPendiente.toFixed(2)}
                        </p>
                    </div>

                    {/* Fecha */}
                    <div className="space-y-2">
                        <Label htmlFor="fechaPago">Fecha de Pago</Label>
                        <Input
                            id="fechaPago"
                            name="fechaPago"
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    {/* Método de Pago */}
                    <div className="space-y-2">
                        <Label htmlFor="metodoPago">
                            Método de Pago <span className="text-red-500">*</span>
                        </Label>
                        <Select name="metodoPago" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione método" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Efectivo">Efectivo</SelectItem>
                                <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                                <SelectItem value="Tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Pago Móvil">Pago Móvil</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Referencia */}
                    <div className="space-y-2">
                        <Label htmlFor="referencia">Referencia/Número de Transacción</Label>
                        <Input
                            id="referencia"
                            name="referencia"
                            type="text"
                            placeholder="Ej: 123456789"
                        />
                    </div>

                    {/* Comprobante */}
                    <div className="space-y-2">
                        <Label htmlFor="comprobante">Comprobante de Pago</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="comprobante"
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="flex-1"
                            />
                            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                        {selectedFile && (
                            <p className="text-sm text-green-600">
                                ✓ {selectedFile.name} subido exitosamente
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Formatos permitidos: JPG, PNG, PDF (máx. 5MB)
                        </p>
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                        <Label htmlFor="notas">Observaciones</Label>
                        <Textarea
                            id="notas"
                            name="notas"
                            placeholder="Notas adicionales..."
                            rows={3}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={uploading || !monto}>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Registrar Pago
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
