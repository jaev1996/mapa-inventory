'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { updateVenta } from '@/app/actions/sales-actions';
import { Repuesto } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRepuestos } from '@/app/actions/inventory-actions';

interface VentaItem {
    idHistorico?: number;
    codigoVenta?: string;
    codigoRep: string;
    cantidadRep: number;
    precioRep: number;
    subtotalRep: number;
    Repuesto?: { descripRep: string };
}

interface VentaData {
    idVenta: number;
    codigoVenta: string;
    idCliente: number;
    idVendedor: number;
    estatusVenta: string;
    items: VentaItem[];
}

interface EditVentaFormProps {
    venta: VentaData;
    onCancel: () => void;
    onSuccess: () => void;
}

export function EditVentaForm({ venta, onCancel, onSuccess }: EditVentaFormProps) {
    const [items, setItems] = useState<VentaItem[]>(venta.items || []);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Product Search State
    const [openCombobox, setOpenCombobox] = useState(false);
    const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadRepuestos = async (query: string) => {
        if (!query) return;
        setSearchQuery(query);
        const data = await getRepuestos(1, 5, query);
        setRepuestos(data.data || []);
    };

    const handleAddItem = (repuesto: Repuesto) => {
        const existing = items.find(i => i.codigoRep === repuesto.codigoRep);
        if (existing) {
            toast.error('Este producto ya está en la lista');
            return;
        }

        const newItem: VentaItem = {
            codigoVenta: venta.codigoVenta,
            codigoRep: repuesto.codigoRep,
            cantidadRep: 1,
            precioRep: repuesto.precioRep,
            subtotalRep: repuesto.precioRep,
            Repuesto: { descripRep: repuesto.descripRep }
        };

        setItems([...items, newItem]);
        setOpenCombobox(false);
        toast.success('Producto agregado');
    };

    const handleUpdateItem = (index: number, field: string, value: string) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'cantidadRep') {
            const qty = Number(value);
            if (qty < 1) return;
            item.cantidadRep = qty;
            item.subtotalRep = qty * item.precioRep;
        } else if (field === 'precioRep') {
            const price = Number(value);
            if (price < 0) return;
            item.precioRep = price;
            item.subtotalRep = item.cantidadRep * price;
        }

        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                items: items,
                idCliente: venta.idCliente, // Preserve existing header data for now
                idVendedor: venta.idVendedor,
                estatusVenta: venta.estatusVenta
            };

            const result = await updateVenta(venta.idVenta, payload);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Venta actualizada correctamente');
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar cambios');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const total = items.reduce((sum, item) => sum + item.subtotalRep, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-800">
                    <Pencil className="h-5 w-5" />
                    <span className="font-semibold">Modo Edición</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onCancel}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                    </Button>
                    <Button size="sm" onClick={() => setShowConfirm(true)}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            {/* Add Item Section */}
            <div className="flex items-center gap-4">
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-[400px] justify-between"
                        >
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <Search className="h-4 w-4" />
                                Buscar producto para agregar...
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Buscar por código o nombre..."
                                onValueChange={loadRepuestos}
                            />
                            <CommandList>
                                <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                <CommandGroup heading="Resultados">
                                    {repuestos.map((repuesto) => (
                                        <CommandItem
                                            key={repuesto.codigoRep}
                                            value={repuesto.codigoRep}
                                            onSelect={() => handleAddItem(repuesto)}
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{repuesto.descripRep}</span>
                                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                    <span>{repuesto.codigoRep}</span>
                                                    <span>Stock: {repuesto.cantidadRep}</span>
                                                    <span>${repuesto.precioRep}</span>
                                                </div>
                                            </div>
                                            <Check
                                                className={cn(
                                                    "ml-auto h-4 w-4",
                                                    items.some(i => i.codigoRep === repuesto.codigoRep) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left">Producto</th>
                            <th className="px-4 py-3 text-center w-32">Cantidad</th>
                            <th className="px-4 py-3 text-right w-32">Precio</th>
                            <th className="px-4 py-3 text-right w-32">Subtotal</th>
                            <th className="px-4 py-3 w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.map((item, index) => (
                            <tr key={index} className="bg-white">
                                <td className="px-4 py-2">
                                    <div className="font-medium">{item.Repuesto?.descripRep || item.codigoRep}</div>
                                    <div className="text-xs text-muted-foreground">{item.codigoRep}</div>
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.cantidadRep}
                                        onChange={(e) => handleUpdateItem(index, 'cantidadRep', e.target.value)}
                                        className="text-center h-8"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.precioRep}
                                        onChange={(e) => handleUpdateItem(index, 'precioRep', e.target.value)}
                                        className="text-right h-8"
                                    />
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                    ${item.subtotalRep.toFixed(2)}
                                </td>
                                <td className="px-4 py-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleRemoveItem(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                        <tr>
                            <td colSpan={3} className="px-4 py-3 text-right font-bold">Total:</td>
                            <td className="px-4 py-3 text-right font-bold text-lg text-blue-600">
                                ${total.toFixed(2)}
                            </td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar cambios</DialogTitle>
                        <DialogDescription>
                            Estás a punto de modificar una nota de entrega existente.
                            Esta acción afectará el inventario (devoluciones/salidas) y quedará registrada en la auditoría.
                            ¿Estás seguro de continuar?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={loading}>
                            {loading ? 'Guardando...' : 'Confirmar y Guardar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
