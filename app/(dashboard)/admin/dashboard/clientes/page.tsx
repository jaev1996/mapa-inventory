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

import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, UserPlus, Phone, MapPin, Hash, UserCircle } from 'lucide-react';

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCliente, setEditingCliente] = useState<Cliente | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
    const [isPending, startTransition] = useTransition();

    // Filtros y Paginación
    const [searchNombre, setSearchNombre] = useState('');
    const [searchCodigo, setSearchCodigo] = useState('');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const loadData = useCallback(async () => {
        setIsLoading(true);
        const [clientesRes, vendedoresRes] = await Promise.all([
            getClientes(page, pageSize, { nombre: searchNombre, codigo: searchCodigo }),
            getVendedores(1, 100) // All for select
        ]);
        setClientes(clientesRes.data);
        setTotalItems(clientesRes.count);
        setVendedores(vendedoresRes.data);
        setIsLoading(false);
    }, [page, searchNombre, searchCodigo]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingCliente(undefined);
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
                loadData();
            } catch (error) {
                console.error("Error al eliminar:", error);
            } finally {
                setClienteToDelete(null);
            }
        });
    };

    if (showForm) {
        return <ClienteForm initialData={editingCliente} onClose={handleCloseForm} vendedores={vendedores} />;
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
                    <p className="text-sm text-muted-foreground mt-1">Administra la base de datos de clientes y sus vendedores asignados.</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                </Button>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre..."
                                className="pl-9"
                                value={searchNombre}
                                onChange={(e) => {
                                    setSearchNombre(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="relative w-full md:w-64">
                            <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="RIF / Cédula..."
                                className="pl-9"
                                value={searchCodigo}
                                onChange={(e) => {
                                    setSearchCodigo(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[140px] font-bold">Identificación</TableHead>
                                <TableHead className="font-bold">Nombre / Razón Social</TableHead>
                                <TableHead className="font-bold">Vendedor</TableHead>
                                <TableHead className="font-bold">Contacto</TableHead>
                                <TableHead className="font-bold">Ubicación</TableHead>
                                <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                                            Cargando información...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : clientes.length > 0 ? (
                                clientes.map((cliente) => {
                                    const vendedor = vendedores.find(v => v.idVendedor === cliente.idVendedor);
                                    return (
                                        <TableRow key={cliente.idCliente} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell>
                                                <span className="font-mono text-xs font-bold bg-gray-100 px-2 py-1 rounded">
                                                    {cliente.codigoCliente}
                                                </span>
                                            </TableCell>
                                            <TableCell className="font-medium">{cliente.nombreCliente}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm">{vendedor?.nombreVendedor || 'No asignado'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm font-mono">{cliente.telefonoCliente}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 max-w-[200px] truncate">
                                                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="text-xs italic text-muted-foreground">{cliente.direccionCliente}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingCliente(cliente);
                                                            setShowForm(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(cliente)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No se encontraron clientes con los filtros aplicados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                        <p className="text-sm text-muted-foreground">
                            Mostrando <span className="font-medium">{(page - 1) * pageSize + 1}</span> a <span className="font-medium">{Math.min(page * pageSize, totalItems)}</span> de <span className="font-medium">{totalItems}</span> clientes
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <Button
                                        key={p}
                                        variant={page === p ? "default" : "ghost"}
                                        size="sm"
                                        className="w-8 h-8 p-0"
                                        onClick={() => setPage(p)}
                                    >
                                        {p}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
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
        </div>
    );
}