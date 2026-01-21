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
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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
    const [imageProcessing, setImageProcessing] = useState(false);
    const [marcas, setMarcas] = useState<MarcaRepuesto[]>([]);
    const [tipos, setTipos] = useState<TipoRepuesto[]>([]);

    const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        codigoRep: '',
        descripRep: '',
        cantidadRep: 0,
        precioRep: 0,
        idMarca: '',
        idTipo: '',
        ubicRep: '',
    });

    // Image State
    const [files, setFiles] = useState<File[]>([]); // New files to upload
    const [keepImages, setKeepImages] = useState<string[]>([]); // Existing urls to keep
    const [deleteImages, setDeleteImages] = useState<string[]>([]); // Existing urls to delete

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
            // Initialize images
            setKeepImages(initialData.imagenes || []);
            setFiles([]);
            setDeleteImages([]);
        } else {
            // Reset
            setFormData({
                codigoRep: '',
                descripRep: '',
                cantidadRep: 0,
                precioRep: 0,
                idMarca: '',
                idTipo: '',
                ubicRep: '',
            });
            setKeepImages([]);
            setFiles([]);
            setDeleteImages([]);
        }
        setErrors(null);
    }, [initialData, open]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // Check limits
            const totalImages = keepImages.length + files.length + newFiles.length;
            if (totalImages > 3) {
                alert('No puedes subir más de 3 imágenes en total.');
                return;
            }

            setImageProcessing(true);
            try {
                const compressedFiles: File[] = [];
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1024,
                    useWebWorker: true,
                };

                for (const file of newFiles) {
                    // Compress only images
                    if (file.type.startsWith('image/')) {
                        const compressedFile = await imageCompression(file, options);
                        compressedFiles.push(compressedFile);
                    }
                }

                setFiles(prev => [...prev, ...compressedFiles]);
            } catch (error) {
                console.error('Error compressing images:', error);
            } finally {
                setImageProcessing(false);
            }
        }
    };

    const removeNewFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (url: string) => {
        setKeepImages(prev => prev.filter(img => img !== url));
        setDeleteImages(prev => [...prev, url]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            // Append Image Data
            files.forEach(file => {
                data.append('newImages', file);
            });
            data.append('keepImages', JSON.stringify(keepImages));
            data.append('deleteImages', JSON.stringify(deleteImages));

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
                alert(`Error: ${result.message}`);
            } else {
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
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? 'Editar Repuesto' : 'Nuevo Repuesto'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">

                        {/* Images Section */}
                        <div className="space-y-2">
                            <Label>Imágenes (Máx 3) - Opcional</Label>
                            <div className="border border-dashed rounded-lg p-4 flex flex-col gap-4">
                                <div className="flex flex-wrap gap-4">
                                    {/* Existing Images */}
                                    {keepImages.map((url, idx) => (
                                        <div key={`existing-${idx}`} className="relative group w-24 h-24 rounded-md overflow-hidden border">
                                            <img src={url} alt={`Imagen ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(url)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* New Files Preview */}
                                    {files.map((file, idx) => (
                                        <div key={`new-${idx}`} className="relative group w-24 h-24 rounded-md overflow-hidden border bg-gray-50">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    {(keepImages.length + files.length) < 3 && (
                                        <label className="w-24 h-24 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 dark:bg-zinc-800/50">
                                            {imageProcessing ? (
                                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                            ) : (
                                                <>
                                                    <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                                    <span className="text-xs text-gray-500">Subir</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/webp"
                                                multiple
                                                onChange={handleFileSelect}
                                                disabled={imageProcessing}
                                            />
                                        </label>
                                    )}
                                </div>
                                {errors?.imagenes && (
                                    <p className="text-red-500 text-sm">{errors.imagenes[0]}</p>
                                )}
                            </div>
                        </div>

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
                        <Button type="submit" disabled={loading || imageProcessing}>
                            {loading || imageProcessing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                            ) : (
                                'Guardar'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
