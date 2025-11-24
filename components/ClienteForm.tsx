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
        if (state.message === '') { // Éxito
            onClose();
        } else if (state.message) { // Error
            // Aquí puedes mostrar el error con un toast
            // alert(state.message);
        }
    }, [state, onClose]);

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isEditing ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</CardTitle>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    {isEditing && <input type="hidden" name="idCliente" value={initialData.idCliente} />}

                    <div className="space-y-2">
                        <Label htmlFor="codigoCliente">Código de Cliente</Label>
                        <Input id="codigoCliente" name="codigoCliente" defaultValue={initialData?.codigoCliente} />
                        {state.errors?.codigoCliente && (
                            <p className="text-red-500 text-sm">{state.errors.codigoCliente[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nombreCliente">Nombre</Label>
                        <Input id="nombreCliente" name="nombreCliente" defaultValue={initialData?.nombreCliente} />
                        {state.errors?.nombreCliente && (
                            <p className="text-red-500 text-sm">{state.errors.nombreCliente[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telefonoCliente">Teléfono</Label>
                        <Input id="telefonoCliente" name="telefonoCliente" defaultValue={initialData?.telefonoCliente} />
                        {state.errors?.telefonoCliente && (
                            <p className="text-red-500 text-sm">{state.errors.telefonoCliente[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="direccionCliente">Dirección</Label>
                        <Input id="direccionCliente" name="direccionCliente" defaultValue={initialData?.direccionCliente} />
                        {state.errors?.direccionCliente && (
                            <p className="text-red-500 text-sm">{state.errors.direccionCliente[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="idVendedor">Vendedor</Label>
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
                            <p className="text-red-500 text-sm">{state.errors.idVendedor[0]}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <SubmitButton isEditing={isEditing} />
                </CardFooter>
            </form>
        </Card>
    );
}