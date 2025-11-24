// app/clientes/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { getVendedores, Vendedor } from '@/app/vendedores/actions';
import { getClientes, deleteCliente, Cliente } from './actions';
import { ClienteForm } from '@/components/ClienteForm';
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

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
    const [isPending, startTransition] = useTransition();

    // Función para cargar los datos, envuelta en useCallback
    const loadData = useCallback(async () => {
        setIsLoading(true);
        // Cargar clientes y vendedores en paralelo para mayor eficiencia
        const [clientesData, vendedoresData] = await Promise.all([
            getClientes(),
            getVendedores()
        ]);
        setClientes(clientesData);
        setVendedores(vendedoresData);
        setIsLoading(false);
    }, []);

    // Cargar datos iniciales al montar el componente
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Cierra el formulario y recarga los datos
    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingCliente(undefined);
        // Llamamos a loadData para refrescar la lista después de una creación/actualización.
        loadData();
    }, [loadData]);

    const handleDelete = (cliente: Cliente) => {
        setClienteToDelete(cliente);
    };

    const handleConfirmDelete = () => {
        if (!clienteToDelete) return;

        startTransition(async () => {
            try {
                await deleteCliente(clienteToDelete.idCliente);
                loadData(); // Recargar datos tras eliminar
            } catch (error) {
                console.error("Error al eliminar:", error);
                // Aquí podrías mostrar una notificación de error
            } finally {
                setClienteToDelete(null); // Cerrar el modal
            }
        });
    };

    if (showForm) {
        return <ClienteForm initialData={editingCliente} onClose={handleCloseForm} vendedores={vendedores} />;
    }

    return (
        <>
            <Card className="m-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Gestión de Clientes</CardTitle>
                    <Button onClick={() => setShowForm(true)}>
                        ➕ Añadir Nuevo Cliente
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Cargando clientes...</p>
                    ) : clientes.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Vendedor</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead>Dirección</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clientes.map((cliente) => {
                                    const vendedor = vendedores.find(v => v.idVendedor === cliente.idVendedor);
                                    return (
                                        <TableRow key={cliente.idCliente}>
                                            <TableCell>{cliente.codigoCliente}</TableCell>
                                            <TableCell>{cliente.nombreCliente}</TableCell>
                                            <TableCell>{vendedor?.nombreVendedor || 'N/A'}</TableCell>
                                            <TableCell>{cliente.telefonoCliente}</TableCell>
                                            <TableCell>{cliente.direccionCliente}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-2 justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingCliente(cliente);
                                                            setShowForm(true);
                                                        }}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(cliente)}>
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <p>No hay clientes para mostrar. ¡Añade uno nuevo!</p>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!clienteToDelete} onOpenChange={() => setClienteToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el cliente
                            <strong> {clienteToDelete?.nombreCliente}</strong>.
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