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
    const [state, formAction] = useActionState(action, initialState);

    useEffect(() => {
        if (state.message === '') {
            onClose();
        }
    }, [state, onClose]);

    const formatPhone = (value: string) => {
        let cleaned = value.replace(/\D/g, '');
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
        <Card className="w-full max-w-2xl mx-auto border-indigo-100 shadow-lg">
            <CardHeader className="bg-indigo-50/50">
                <CardTitle className="text-indigo-800 flex items-center gap-2">
                    {isEditing ? '📝 Editar Vendedor' : '👔 Añadir Nuevo Vendedor'}
                </CardTitle>
            </CardHeader>
            <form action={formAction}>
                <CardContent className="space-y-4 pt-6">
                    {isEditing && <input type="hidden" name="idVendedor" value={initialData.idVendedor} />}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="codigoVendedor">Código Interno</Label>
                            <Input
                                id="codigoVendedor"
                                name="codigoVendedor"
                                placeholder="V-001"
                                defaultValue={initialData?.codigoVendedor}
                            />
                            {state.errors?.codigoVendedor && (
                                <p className="text-red-500 text-xs font-medium">{state.errors.codigoVendedor[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="telefonoVendedor">Teléfono de Contacto</Label>
                            <Input
                                id="telefonoVendedor"
                                name="telefonoVendedor"
                                placeholder="+58 412 123 4567"
                                defaultValue={initialData?.telefonoVendedor}
                                onChange={(e) => {
                                    e.target.value = formatPhone(e.target.value);
                                }}
                            />
                            {state.errors?.telefonoVendedor && (
                                <p className="text-red-500 text-xs font-medium">{state.errors.telefonoVendedor[0]}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nombreVendedor">Nombre Completo</Label>
                        <Input
                            id="nombreVendedor"
                            name="nombreVendedor"
                            placeholder="Nombre del Vendedor"
                            defaultValue={initialData?.nombreVendedor}
                        />
                        {state.errors?.nombreVendedor && (
                            <p className="text-red-500 text-sm font-medium">{state.errors.nombreVendedor[0]}</p>
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
