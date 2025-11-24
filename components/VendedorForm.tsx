// components/VendedorForm.tsx
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Vendedor, createVendedor, updateVendedor } from '@/app/vendedores/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface VendedorFormProps {
    initialData?: Vendedor;
    onClose: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Vendedor')}
        </Button>
    );
}

export function VendedorForm({ initialData, onClose }: VendedorFormProps) {
    const isEditing = !!initialData;
    const action = isEditing ? updateVendedor : createVendedor;

    const initialState: { message: string | null; errors?: Record<string, string[]> } = { message: null, errors: {} };
    // useFormState para manejar la respuesta de la acción del servidor
    const [state, formAction] = useActionState(action, initialState);

    useEffect(() => {
        // Si la acción fue exitosa (sin mensaje de error), cerramos el formulario.
        // El `revalidatePath` en la server action se encargará de refrescar los datos.
        if (state.message === '') { // Éxito
            onClose();
        } else if (state.message) { // Error
            // Aquí puedes mostrar el error con un toast, por ejemplo:
            // toast.error(state.message);
        }
    }, [state, onClose]);

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{isEditing ? 'Editar Vendedor' : 'Añadir Nuevo Vendedor'}</CardTitle>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4">
                    {isEditing && <input type="hidden" name="idVendedor" value={initialData.idVendedor} />}

                    <div className="space-y-2">
                        <Label htmlFor="codigoVendedor">Código del Vendedor</Label>
                        <Input
                            id="codigoVendedor"
                            name="codigoVendedor"
                            defaultValue={initialData?.codigoVendedor}
                        />
                        {state.errors?.codigoVendedor && (
                            <p className="text-red-500 text-sm">{state.errors.codigoVendedor[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nombreVendedor">Nombre del Vendedor</Label>
                        <Input
                            id="nombreVendedor"
                            name="nombreVendedor"
                            defaultValue={initialData?.nombreVendedor}
                        />
                        {state.errors?.nombreVendedor && (
                            <p className="text-red-500 text-sm">{state.errors.nombreVendedor[0]}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telefonoVendedor">Teléfono</Label>
                        <Input
                            id="telefonoVendedor"
                            name="telefonoVendedor"
                            defaultValue={initialData?.telefonoVendedor}
                        />
                        {state.errors?.telefonoVendedor && (
                            <p className="text-red-500 text-sm">{state.errors.telefonoVendedor[0]}</p>
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
