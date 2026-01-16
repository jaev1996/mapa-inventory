'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { MarcaForm } from '@/components/inventory/MarcaForm';
import { DeleteConfirmation } from '@/components/inventory/DeleteConfirmation';
import { getMarcas, deleteMarca } from '@/app/actions/inventory-actions';
import { MarcaRepuesto } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

function MarcasContent() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';

    const [data, setData] = useState<MarcaRepuesto[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MarcaRepuesto | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, count } = await getMarcas(page, 10, search);
                setData(data);
                setTotalCount(count || 0);
            } catch (error) {
                console.error('Error fetching marcas:', error);
            }
        };
        fetchData();
    }, [page, search, refreshTrigger]);

    const refresh = () => setRefreshTrigger((prev) => prev + 1);

    const handleEdit = (item: MarcaRepuesto) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = (item: MarcaRepuesto) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            await deleteMarca(selectedItem.idMarca);
            setIsDeleteOpen(false);
            refresh();
        }
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const columns = [
        { header: 'ID', accessorKey: 'idMarca' as keyof MarcaRepuesto, className: 'w-[100px]' },
        { header: 'Descripción', accessorKey: 'descripMarca' as keyof MarcaRepuesto },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Marca
                </Button>
            </div>

            <InventoryTable
                data={data}
                columns={columns}
                totalCount={totalCount}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <MarcaForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedItem}
                onSuccess={refresh}
            />

            <DeleteConfirmation
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={confirmDelete}
                title="Eliminar Marca"
                description={`¿Estás seguro de que deseas eliminar la marca "${selectedItem?.descripMarca}"?`}
            />
        </div>
    );
}

export default function MarcasPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <MarcasContent />
        </Suspense>
    );
}
