'use client';

import { useState } from 'react';
import { type FacturaEstado } from '@/app/actions/payment-actions';
import { RegistrarPagoDialog } from './RegistrarPagoDialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Eye, DollarSign } from 'lucide-react';
import { VentasPagosDialog } from './VentasPagosDialog';

type ListadoFacturasProps = {
    facturas: FacturaEstado[];
    mostrarAcciones?: boolean;
};

import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

export function ListadoFacturas({ facturas, mostrarAcciones = true }: ListadoFacturasProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstatus, setFiltroEstatus] = useState<string>('todos');
    const [currentPage, setCurrentPage] = useState(1);

    // Filter facturas
    const facturasFiltradas = facturas.filter((factura) => {
        const matchesSearch =
            factura.codigoVenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
            factura.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstatus =
            filtroEstatus === 'todos' ||
            (filtroEstatus === 'pendiente' && factura.estatusPago === 'Pendiente') ||
            (filtroEstatus === 'parcial' && factura.estatusPago === 'Pago Parcial') ||
            (filtroEstatus === 'pagada' && factura.estatusPago === 'Pagada');

        return matchesSearch && matchesEstatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(facturasFiltradas.length / ITEMS_PER_PAGE);

    // Ensure currentPage is valid (e.g. if filtering reduced items)
    const validPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
    // Note: We don't prefer set state during render, so we use validPage for slicing
    // If validPage != currentPage, we could effect-update it, but derivation is safer for now.

    const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
    const currentItems = facturasFiltradas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleFilterChange = (value: string) => {
        setFiltroEstatus(value);
        setCurrentPage(1);
    };

    const getEstatusBadge = (estatus: string) => {
        switch (estatus) {
            case 'Pagada':
                return <Badge variant="default" className="bg-green-600">Pagada</Badge>;
            case 'Pago Parcial':
                return <Badge variant="default" className="bg-yellow-600">Pago Parcial</Badge>;
            case 'Pendiente':
                return <Badge variant="destructive">Pendiente</Badge>;
            default:
                return <Badge variant="secondary">{estatus}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar por código o cliente..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filtroEstatus} onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filtrar por estatus" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="parcial">Pago Parcial</SelectItem>
                        <SelectItem value="pagada">Pagada</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Results count */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <p>Mostrando {currentItems.length} de {facturasFiltradas.length} resultados</p>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Código Venta</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Monto Total</TableHead>
                                <TableHead className="text-right">Pagado</TableHead>
                                <TableHead className="text-right">Saldo Pendiente</TableHead>
                                <TableHead>Estatus</TableHead>
                                {mostrarAcciones && <TableHead className="text-right">Acciones</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {facturasFiltradas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={mostrarAcciones ? 8 : 7} className="text-center py-8 text-muted-foreground">
                                        No se encontraron facturas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                currentItems.map((factura) => (
                                    <TableRow key={factura.codigoVenta}>
                                        <TableCell className="font-medium">{factura.codigoVenta}</TableCell>
                                        <TableCell>{factura.nombreCliente}</TableCell>
                                        <TableCell>
                                            {new Date(factura.fechaVenta).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ${factura.montoTotal.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right text-green-600">
                                            ${factura.montoPagado.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-orange-600">
                                            ${factura.saldoPendiente.toFixed(2)}
                                        </TableCell>
                                        <TableCell>{getEstatusBadge(factura.estatusPago)}</TableCell>
                                        {mostrarAcciones && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <VentasPagosDialog
                                                        factura={factura}
                                                        trigger={
                                                            <Button size="sm" variant="outline">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        }
                                                    />
                                                    {factura.saldoPendiente > 0 && (
                                                        <RegistrarPagoDialog
                                                            factura={factura}
                                                            trigger={
                                                                <Button size="sm" variant="default">
                                                                    <DollarSign className="w-4 h-4" />
                                                                </Button>
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={validPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
}
