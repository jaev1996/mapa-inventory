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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Repuesto, MarcaRepuesto, TipoRepuesto } from '@/lib/types';
import { useState, useEffect } from 'react';
import { createRepuesto, updateRepuesto, getAllMarcas, getAllTipos } from '@/app/actions/inventory-actions';

interface RepuestoFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Repuesto | null;
    onSuccess: () => void;
}

export function RepuestoForm({
    open,
    onOpenChange,
    initialData,
    onSuccess,
}: RepuestoFormProps) {
    const [loading, setLoading] = useState(false);
    const [marcas, setMarcas] = useState<MarcaRepuesto[]>([]);
    const [tipos, setTipos] = useState<TipoRepuesto[]>([]);

    const [errors, setErrors] = useState<Record<string, string[]> | null>(null);
    const [formData, setFormData] = useState({
        codigoRep: '',
        descripRep: '',
        cantidadRep: 0,
        precioRep: 0,
        idMarca: '',
        idTipo: '',
        ubicRep: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            const [marcasData, tiposData] = await Promise.all([
                getAllMarcas(),
                getAllTipos(),
            ]);
            setMarcas(marcasData);
            setTipos(tiposData);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                codigoRep: initialData.codigoRep,
                descripRep: initialData.descripRep,
                cantidadRep: initialData.cantidadRep,
                precioRep: initialData.precioRep,
                idMarca: initialData.idMarca.toString(),
                idTipo: initialData.idTipo.toString(),
                ubicRep: initialData.ubicRep,
            });
        } else {
            setFormData({
                codigoRep: '',
                descripRep: '',
                cantidadRep: 0,
                precioRep: 0,
                idMarca: '',
                idTipo: '',
                ubicRep: '',
            });
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            let result;
            if (initialData) {
                result = await updateRepuesto(initialData.idRep, null, data);
            } else {
                result = await createRepuesto(null, data);
            }

            if (result?.errors) {
                setErrors(result.errors);
            } else if (result?.message) {
                console.error(result.message);
                // Optionally show a toast error here
            } else {
                setErrors(null);
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error('Error saving repuesto:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Editar Repuesto' : 'Nuevo Repuesto'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="codigoRep">Código</Label>
                                <Input
                                    id="codigoRep"
                                    value={formData.codigoRep}
                                    onChange={(e) =>
                                        setFormData({ ...formData, codigoRep: e.target.value })
                                    }
                                />
                                {errors?.codigoRep && (
                                    <p className="text-red-500 text-sm">{errors.codigoRep[0]}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="descripRep">Descripción</Label>
                                <Input
                                    id="descripRep"
                                    value={formData.descripRep}
                                    onChange={(e) =>
                                        setFormData({ ...formData, descripRep: e.target.value })
                                    }
                                />
                                {errors?.descripRep && (
                                    <p className="text-red-500 text-sm">{errors.descripRep[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cantidadRep">Cantidad</Label>
                                <Input
                                    id="cantidadRep"
                                    type="number"
                                    value={formData.cantidadRep}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cantidadRep: parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                                {errors?.cantidadRep && (
                                    <p className="text-red-500 text-sm">{errors.cantidadRep[0]}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="precioRep">Precio</Label>
                                <Input
                                    id="precioRep"
                                    type="number"
                                    step="0.01"
                                    value={formData.precioRep}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            precioRep: parseFloat(e.target.value) || 0,
                                        })
                                    }
                                />
                                {errors?.precioRep && (
                                    <p className="text-red-500 text-sm">{errors.precioRep[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="idMarca">Marca</Label>
                                <Select
                                    value={formData.idMarca}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, idMarca: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {marcas.map((marca) => (
                                            <SelectItem
                                                key={marca.idMarca}
                                                value={marca.idMarca.toString()}
                                            >
                                                {marca.descripMarca}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors?.idMarca && (
                                    <p className="text-red-500 text-sm">{errors.idMarca[0]}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="idTipo">Tipo</Label>
                                <Select
                                    value={formData.idTipo}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, idTipo: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tipos.map((tipo) => (
                                            <SelectItem
                                                key={tipo.idTipo}
                                                value={tipo.idTipo.toString()}
                                            >
                                                {tipo.descripTipo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors?.idTipo && (
                                    <p className="text-red-500 text-sm">{errors.idTipo[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ubicRep">Ubicación</Label>
                            <Input
                                id="ubicRep"
                                value={formData.ubicRep}
                                onChange={(e) =>
                                    setFormData({ ...formData, ubicRep: e.target.value })
                                }
                                required
                            />
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
