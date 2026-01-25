'use client';

export const dynamic = 'force-dynamic';


import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InventoryTable } from '@/components/inventory/InventoryTable';
import { TipoForm } from '@/components/inventory/TipoForm';
import { DeleteConfirmation } from '@/components/inventory/DeleteConfirmation';
import { getTipos, deleteTipo } from '@/app/actions/inventory-actions';
import { TipoRepuesto } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

function TiposContent() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';

    const [data, setData] = useState<TipoRepuesto[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<TipoRepuesto | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, count } = await getTipos(page, 10, search);
                setData(data);
                setTotalCount(count || 0);
            } catch (error) {
                console.error('Error fetching tipos:', error);
            }
        };
        fetchData();
    }, [page, search, refreshTrigger]);

    const refresh = () => setRefreshTrigger((prev) => prev + 1);

    const handleEdit = (item: TipoRepuesto) => {
        setSelectedItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = (item: TipoRepuesto) => {
        setSelectedItem(item);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedItem) {
            await deleteTipo(selectedItem.idTipo);
            setIsDeleteOpen(false);
            refresh();
        }
    };

    const handleCreate = () => {
        setSelectedItem(null);
        setIsFormOpen(true);
    };

    const columns = [
        { header: 'ID', accessorKey: 'idTipo' as keyof TipoRepuesto, className: 'w-[100px]' },
        { header: 'Descripción', accessorKey: 'descripTipo' as keyof TipoRepuesto },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Tipo
                </Button>
            </div>

            <InventoryTable
                data={data}
                columns={columns}
                totalCount={totalCount}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <TipoForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedItem}
                onSuccess={refresh}
            />

            <DeleteConfirmation
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={confirmDelete}
                title="Eliminar Tipo"
                description={`¿Estás seguro de que deseas eliminar el tipo "${selectedItem?.descripTipo}"?`}
            />
        </div>
    );
}

export default function TiposPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <TiposContent />
        </Suspense>
    );
}
