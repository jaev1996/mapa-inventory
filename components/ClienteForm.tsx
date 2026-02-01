// components/ClienteForm.tsx
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Cliente, createCliente, updateCliente } from '@/app/clientes/actions';
import { Vendedor } from '@/app/vendedores/actions'; // Importar el tipo Vendedor
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ClienteFormProps {
    initialData?: Cliente;
    onClose: () => void;
    vendedores: Vendedor[]; // Recibir la lista de vendedores
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Cliente')}
        </Button>
    );
}

export function ClienteForm({ initialData, onClose, vendedores }: ClienteFormProps) {
    const isEditing = !!initialData;
    const action = isEditing ? updateCliente : createCliente;
    const initialState: { message: string | null; errors?: Record<string, string[]> } = { message: null, errors: {} };
    const [state, formAction] = useActionState(action, initialState);

    useEffect(() => {
        if (state.message === '') {
            onClose();
        }
    }, [state, onClose]);

    const formatID = (value: string) => {
        const cleaned = value.toUpperCase().replace(/[^VJEG0-9]/g, '');
        if (cleaned.length === 0) return '';
        if (cleaned.length === 1) return cleaned;
        return `${cleaned[0]}-${cleaned.slice(1, 10)}`;
    };

    const formatPhone = (value: string) => {
        // Remove everything except numbers
        let cleaned = value.replace(/\D/g, '');

        // If it starts with 58, keep it, otherwise assume it needs +58
        if (cleaned.startsWith('58')) {
            cleaned = cleaned.slice(0, 12);
        } else {
            cleaned = ('58' + cleaned).slice(0, 12);
        }

        if (cleaned.length <= 2) return `+${cleaned}`;
        if (cleaned.length <= 5) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        if (cleaned.length <= 8) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 12)}`;
    };

    return (
        <Card className="w-full max-w-2xl mx-auto border-blue-100 shadow-lg">
            <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                    {isEditing ? '📝 Editar Cliente' : '👤 Añadir Nuevo Cliente'}
                </CardTitle>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4 pt-6">
                    {isEditing && <input type="hidden" name="idCliente" value={initialData.idCliente} />}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigoCliente">RIF / Cédula (V, J, E, G)</Label>
                            <Input
                                id="codigoCliente"
                                name="codigoCliente"
                                placeholder="V-12345678"
                                defaultValue={initialData?.codigoCliente}
                                onChange={(e) => {
                                    e.target.value = formatID(e.target.value);
                                }}
                            />
                            {state.errors?.codigoCliente && (
                                <p className="text-red-500 text-xs font-medium">{state.errors.codigoCliente[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefonoCliente">Teléfono</Label>
                            <Input
                                id="telefonoCliente"
                                name="telefonoCliente"
                                placeholder="+58 412 123 4567"
                                defaultValue={initialData?.telefonoCliente}
                                onChange={(e) => {
                                    e.target.value = formatPhone(e.target.value);
                                }}
                            />
                            {state.errors?.telefonoCliente && (
                                <p className="text-red-500 text-xs font-medium">{state.errors.telefonoCliente[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nombreCliente">Nombre Completo / Razón Social</Label>
                        <Input id="nombreCliente" name="nombreCliente" defaultValue={initialData?.nombreCliente} />
                        {state.errors?.nombreCliente && (
                            <p className="text-red-500 text-sm font-medium">{state.errors.nombreCliente[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="direccionCliente">Dirección de Entrega</Label>
                        <Input id="direccionCliente" name="direccionCliente" defaultValue={initialData?.direccionCliente} />
                        {state.errors?.direccionCliente && (
                            <p className="text-red-500 text-sm font-medium">{state.errors.direccionCliente[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="idVendedor">Vendedor Asignado</Label>
                        <Select name="idVendedor" defaultValue={initialData?.idVendedor?.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un vendedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendedores.map((vendedor) => (
                                    <SelectItem key={vendedor.idVendedor} value={vendedor.idVendedor.toString()}>
                                        {vendedor.nombreVendedor}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {state.errors?.idVendedor && (
                            <p className="text-red-500 text-sm font-medium">{state.errors.idVendedor[0]}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-gray-50/50 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="hover:bg-red-50 hover:text-red-600 border-red-100">
                        Cancelar
                    </Button>
                    <SubmitButton isEditing={isEditing} />
                </CardFooter>
            </form>
        </Card>
    );
}