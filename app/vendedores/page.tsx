// app/vendedores/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { getVendedores, deleteVendedor, Vendedor } from './actions';
import { VendedorForm } from '@/components/VendedorForm';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function VendedoresPage() {
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingVendedor, setEditingVendedor] = useState<Vendedor | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [vendedorToDelete, setVendedorToDelete] = useState<Vendedor | null>(null);
    const [isPending, startTransition] = useTransition();

    const loadVendedores = useCallback(async () => {
        setIsLoading(true);
        const res = await getVendedores(1, 1000);
        setVendedores(res.data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadVendedores();
    }, [loadVendedores]);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingVendedor(undefined);
        // Llamamos a loadVendedores para refrescar la lista después de una creación/actualización.
        loadVendedores();
    }, [loadVendedores]);

    const handleDelete = (vendedor: Vendedor) => {
        setVendedorToDelete(vendedor);
    };

    const handleConfirmDelete = () => {
        if (!vendedorToDelete) return;

        startTransition(async () => {
            try {
                await deleteVendedor(vendedorToDelete.idVendedor);
                loadVendedores(); // Recargar datos tras eliminar
            } catch (error) {
                console.error("Error al eliminar:", error);
                // Aquí podrías mostrar una notificación de error
            } finally {
                setVendedorToDelete(null); // Cerrar el modal
            }
        });
    };

    if (showForm) {
        return <VendedorForm initialData={editingVendedor} onClose={handleCloseForm} />;
    }

    return (
        <>
            <Card className="m-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Gestión de Vendedores</CardTitle>
                    <Button onClick={() => setShowForm(true)}>
                        ➕ Añadir Nuevo Vendedor
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Cargando vendedores...</p>
                    ) : vendedores.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendedores.map((vendedor) => (
                                    <TableRow key={vendedor.idVendedor}>
                                        <TableCell>{vendedor.codigoVendedor}</TableCell>
                                        <TableCell>{vendedor.nombreVendedor}</TableCell>
                                        <TableCell>{vendedor.telefonoVendedor}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingVendedor(vendedor);
                                                        setShowForm(true);
                                                    }}
                                                >
                                                    Editar
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDelete(vendedor)}>
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>No hay vendedores para mostrar. ¡Añade uno nuevo!</p>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!vendedorToDelete} onOpenChange={() => setVendedorToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el vendedor
                            <strong> {vendedorToDelete?.nombreVendedor}</strong>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} disabled={isPending}>
                            {isPending ? "Eliminando..." : "Confirmar"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
