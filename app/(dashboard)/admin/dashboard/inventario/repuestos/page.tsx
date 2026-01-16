'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { RepuestoForm } from '@/components/inventory/RepuestoForm';
import { DeleteConfirmation } from '@/components/inventory/DeleteConfirmation';
import { getRepuestos, deleteRepuesto } from '@/app/actions/inventory-actions';
import { Repuesto } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

function RepuestosContent() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';
    const lowStock = searchParams.get('lowStock') === 'true';

    const [data, setData] = useState<Repuesto[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Repuesto | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            // Don't fetch if no search term and no low stock filter
            if (!search && !lowStock) {
                setData([]);
                setTotalCount(0);
                return;
            }

            try {
                const { data, count } = await getRepuestos(page, 10, search, lowStock);
                setData(data);
                setTotalCount(count || 0);
            } catch (error) {
                console.error('Error fetching repuestos:', error);
            }
        };
        fetchData();
    }, [page, search, lowStock, refreshTrigger]);

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
        { header: 'Cantidad', accessorKey: 'cantidadRep' as keyof Repuesto },
        { header: 'Precio', accessorKey: 'precioRep' as keyof Repuesto },
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
            <div className="flex justify-end">
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Repuesto
                </Button>
            </div>

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
