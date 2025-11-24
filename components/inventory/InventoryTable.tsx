'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface Column<T> {
    header: string;
    accessorKey: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface InventoryTableProps<T> {
    data: T[];
    columns: Column<T>[];
    totalCount: number;
    onEdit: (item: T) => void;
    onDelete: (item: T) => void;
    pageSize?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function InventoryTable<T extends Record<string, any>>({
    data,
    columns,
    totalCount,
    onEdit,
    onDelete,
    pageSize = 10,
}: InventoryTableProps<T>) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentPage = Number(searchParams.get('page')) || 1;
    const currentSearch = searchParams.get('search') || '';
    const currentLowStock = searchParams.get('lowStock') === 'true';

    const [searchTerm, setSearchTerm] = useState(currentSearch);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleLowStockChange = (checked: boolean) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (checked) {
            params.set('lowStock', 'true');
        } else {
            params.delete('lowStock');
        }
        replace(`${pathname}?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        replace(`${pathname}?${params.toString()}`);
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        setSearchTerm(currentSearch);
    }, [currentSearch]);

    const hasActiveFilter = currentSearch || currentLowStock;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e.target.value);
                    }}
                    className="max-w-sm"
                />

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="tableLowStock"
                        checked={currentLowStock}
                        onChange={(e) => handleLowStockChange(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tableLowStock" className="ml-2 block text-sm text-gray-900">
                        Mostrar solo stock bajo (≤ 5)
                    </label>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col, index) => (
                                <TableHead key={index} className={col.className}>
                                    {col.header}
                                </TableHead>
                            ))}
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!hasActiveFilter && data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 1}
                                    className="h-24 text-center text-gray-500"
                                >
                                    Ingrese un término de búsqueda o seleccione un filtro para ver resultados.
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 1}
                                    className="h-24 text-center"
                                >
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((col, colIndex) => (
                                        <TableCell key={colIndex} className={col.className}>
                                            {typeof col.accessorKey === 'function'
                                                ? col.accessorKey(item)
                                                : item[col.accessorKey]}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onEdit(item)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => onDelete(item)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                </Button>
                <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages || 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
