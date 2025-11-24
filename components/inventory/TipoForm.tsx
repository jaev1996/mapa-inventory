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
import { TipoRepuesto } from '@/lib/types';
import { useState, useEffect } from 'react';
import { createTipo, updateTipo } from '@/app/actions/inventory-actions';

interface TipoFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: TipoRepuesto | null;
    onSuccess: () => void;
}

export function TipoForm({
    open,
    onOpenChange,
    initialData,
    onSuccess,
}: TipoFormProps) {
    const [descripTipo, setDescripTipo] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

    useEffect(() => {
        if (initialData) {
            setDescripTipo(initialData.descripTipo);
        } else {
            setDescripTipo('');
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('descripTipo', descripTipo);

            let result;
            if (initialData) {
                result = await updateTipo(initialData.idTipo, null, formData);
            } else {
                result = await createTipo(null, formData);
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
            console.error('Error saving tipo:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Editar Tipo' : 'Nuevo Tipo'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="descripTipo" className="text-right">
                                Descripción
                            </Label>
                            <Input
                                id="descripTipo"
                                value={descripTipo}
                                onChange={(e) => setDescripTipo(e.target.value)}
                                className="col-span-3"
                            />
                            {errors?.descripTipo && (
                                <p className="text-red-500 text-sm col-span-4 text-right">{errors.descripTipo[0]}</p>
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
