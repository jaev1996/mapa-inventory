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
import { generateInventoryExcel } from '@/app/actions/report-actions';
import { Repuesto, TipoRepuesto } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
    const [isExporting, setIsExporting] = useState(false);

    const handleExportExcel = async () => {
        setIsExporting(true);
        try {
            const base64 = await generateInventoryExcel();
            const binaryString = window.atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Inventario_MAPA_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Reporte generado correctamente');
        } catch (error) {
            console.error('Error exporting excel:', error);
            toast.error('Error al generar el reporte');
        } finally {
            setIsExporting(false);
        }
    };

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
                <div className="flex gap-2 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                    >
                        {isExporting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileDown className="mr-2 h-4 w-4" />
                        )}
                        Exportar Excel
                    </Button>
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Repuesto
                    </Button>
                </div>
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
