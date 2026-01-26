'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { RepuestoForm } from '@/components/inventory/RepuestoForm';
import { DeleteConfirmation } from '@/components/inventory/DeleteConfirmation';
import { RepuestosFilters } from '@/components/inventory/RepuestosFilters';
import { getRepuestos, deleteRepuesto, getAllTipos } from '@/app/actions/inventory-actions';
import { Repuesto, TipoRepuesto } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

function RepuestosContent() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    const tipo = searchParams.get('tipo') || '';

    const [data, setData] = useState<Repuesto[]>([]);
    const [tipos, setTipos] = useState<TipoRepuesto[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Repuesto | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Fetch Tipos only once
    useEffect(() => {
        const fetchTipos = async () => {
            const data = await getAllTipos();
            setTipos(data);
        };
        fetchTipos();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch always to update list based on filters
            // Note: Empty search/filters might return all items with stock > 0 by default (from action)
            try {
                const { data, count } = await getRepuestos(page, 10, search, lowStock, tipo);
                setData(data);
                setTotalCount(count || 0);
            } catch (error) {
                console.error('Error fetching repuestos:', error);
            }
        };
        fetchData();
    }, [page, search, lowStock, tipo, refreshTrigger]);

    const refresh = () => setRefreshTrigger((prev) => prev + 1);

    const handleEdit = (item: Repuesto) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = (item: Repuesto) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            await deleteRepuesto(selectedItem.idRep);
            setIsDeleteOpen(false);
            refresh();
        }
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const columns = [
        { header: 'Código', accessorKey: 'codigoRep' as keyof Repuesto },
        { header: 'Descripción', accessorKey: 'descripRep' as keyof Repuesto },
        {
            header: 'Cantidad',
            accessorKey: 'cantidadRep' as keyof Repuesto,
            className: 'text-right'
        },
        {
            header: 'Precio',
            accessorKey: (item: Repuesto) => `$${item.precioRep.toFixed(2)}`,
            className: 'text-right'
        },
        {
            header: 'Marca',
            accessorKey: (item: Repuesto) => item.MarcaRepuesto?.descripMarca || '-',
        },
        {
            header: 'Tipo',
            accessorKey: (item: Repuesto) => item.TipoRepuesto?.descripTipo || '-',
        },
        { header: 'Ubicación', accessorKey: 'ubicRep' as keyof Repuesto },
    ];

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <h1 className="text-2xl font-bold">Inventario de Repuestos</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Repuesto
                </Button>
            </div>

            <RepuestosFilters tipos={tipos} />

            <InventoryTable
                data={data}
                columns={columns}
                totalCount={totalCount}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <RepuestoForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedItem}
                onSuccess={refresh}
            />

            <DeleteConfirmation
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={confirmDelete}
                title="Eliminar Repuesto"
                description={`¿Estás seguro de que deseas eliminar el repuesto "${selectedItem?.descripRep}"?`}
            />
        </div>
    );
}

export default function RepuestosPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <RepuestosContent />
        </Suspense>
    );
}
