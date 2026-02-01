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
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, UserPlus, Phone, Hash, Briefcase } from 'lucide-react';

export default function VendedoresPage() {
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingVendedor, setEditingVendedor] = useState<Vendedor | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);
    const [vendedorToDelete, setVendedorToDelete] = useState<Vendedor | null>(null);
    const [isPending, startTransition] = useTransition();

    // Filtros y Paginación
    const [searchNombre, setSearchNombre] = useState('');
    const [searchCodigo, setSearchCodigo] = useState('');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;

    const loadVendedores = useCallback(async () => {
        setIsLoading(true);
        const res = await getVendedores(page, pageSize, { nombre: searchNombre, codigo: searchCodigo });
        setVendedores(res.data);
        setTotalItems(res.count);
        setIsLoading(false);
    }, [page, searchNombre, searchCodigo]);

    useEffect(() => {
        loadVendedores();
    }, [loadVendedores]);

    const totalPages = Math.ceil(totalItems / pageSize);

    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingVendedor(undefined);
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
                loadVendedores();
            } catch (error) {
                console.error("Error al eliminar:", error);
                alert(error instanceof Error ? error.message : "Error al eliminar");
            } finally {
                setVendedorToDelete(null);
            }
        });
    };

    if (showForm) {
        return <VendedorForm initialData={editingVendedor} onClose={handleCloseForm} />;
    }

    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Gestión de Vendedores</h1>
                    <p className="text-sm text-muted-foreground mt-1">Administra el equipo de ventas y asignación de códigos internos.</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Vendedor
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
                                placeholder="Código..."
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
                                <TableHead className="w-[140px] font-bold">Código</TableHead>
                                <TableHead className="font-bold">Nombre Completo</TableHead>
                                <TableHead className="font-bold">Teléfono</TableHead>
                                <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                                            Cargando vendedores...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : vendedores.length > 0 ? (
                                vendedores.map((vendedor) => (
                                    <TableRow key={vendedor.idVendedor} className="hover:bg-indigo-50/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-indigo-500" />
                                                <span className="font-mono text-sm font-bold">{vendedor.codigoVendedor}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{vendedor.nombreVendedor}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm font-mono">{vendedor.telefonoVendedor}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingVendedor(vendedor);
                                                        setShowForm(true);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                >
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(vendedor)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No se encontraron vendedores con los filtros aplicados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                        <p className="text-sm text-muted-foreground">
                            Mostrando <span className="font-medium text-indigo-900">{(page - 1) * pageSize + 1}</span> a <span className="font-medium text-indigo-900">{Math.min(page * pageSize, totalItems)}</span> de <span className="font-medium">{totalItems}</span>
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
                                        className={`w-8 h-8 p-0 ${page === p ? 'bg-indigo-600' : ''}`}
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
        </div>
    );
}
