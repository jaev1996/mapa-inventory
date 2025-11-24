'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MarcaRepuesto } from '@/lib/types';
import { useState, useEffect } from 'react';
import { createMarca, updateMarca } from '@/app/actions/inventory-actions';

interface MarcaFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: MarcaRepuesto | null;
    onSuccess: () => void;
}

export function MarcaForm({
    open,
    onOpenChange,
    initialData,
    onSuccess,
}: MarcaFormProps) {
    const [descripMarca, setDescripMarca] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

    useEffect(() => {
        if (initialData) {
            setDescripMarca(initialData.descripMarca);
        } else {
            setDescripMarca('');
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('descripMarca', descripMarca);

            let result;
            if (initialData) {
                result = await updateMarca(initialData.idMarca, null, formData);
            } else {
                result = await createMarca(null, formData);
            }

            if (result?.errors) {
                setErrors(result.errors);
            } else if (result?.message) {
                console.error(result.message);
            } else {
                setErrors(null);
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Error saving marca:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Editar Marca' : 'Nueva Marca'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="descripMarca" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="descripMarca"
                                value={descripMarca}
                                onChange={(e) => setDescripMarca(e.target.value)}
                                className="col-span-3"
                            />
                            {errors?.descripMarca && (
                                <p className="text-red-500 text-sm col-span-4 text-right">{errors.descripMarca[0]}</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
