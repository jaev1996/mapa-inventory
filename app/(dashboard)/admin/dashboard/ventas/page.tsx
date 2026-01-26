'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getVentas, VentasFilters } from '@/app/actions/sales-actions';
import { getClientes, Cliente } from '@/app/clientes/actions';
import { getVendedores, Vendedor } from '@/app/vendedores/actions';
import { Button } from '@/components/ui/button';
import { Plus, Eye, FileText, Search } from 'lucide-react';
import Link from 'next/link';
import { SalesFilters } from '@/components/sales/SalesFilters';
import { Pagination } from '@/components/ui/pagination';

interface Venta {
    idVenta: number;
    codigoVenta: string;
    fechaVenta: string;
    estatusVenta: string;
    tipoPago: string;
    Cliente: { nombreCliente: string };
    Vendedor: { nombreVendedor: string };
}

function VentasContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [ventas, setVentas] = useState<Venta[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const currentPage = Number(searchParams.get('page')) || 1;
    const pageSize = 10;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [clientesData, vendedoresData] = await Promise.all([
                    getClientes(),
                    getVendedores()
                ]);
                setClientes(clientesData);
                setVendedores(vendedoresData);
            } catch (error) {
                console.error('Error loading initial data:', error);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const fetchVentas = async () => {
            setLoading(true);
            try {
                const filters: VentasFilters = {
                    idCliente: searchParams.get('idCliente') || undefined,
                    idVendedor: searchParams.get('idVendedor') || undefined,
                    startDate: searchParams.get('startDate') || undefined,
                    endDate: searchParams.get('endDate') || undefined,
                    codigoVenta: searchParams.get('codigoVenta') || undefined,
                };
                const { data, count } = await getVentas(filters, currentPage, pageSize);
                setVentas(data as Venta[] || []);
                setTotalCount(count || 0);
            } catch (error) {
                console.error('Error fetching ventas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVentas();
    }, [searchParams, currentPage]);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
                        <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Notas de Entrega</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Gestiona, filtra y consulta tus ventas en tiempo real.</p>
                    </div>
                </div>
                <Link href="/admin/dashboard/ventas/nueva">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 px-6 h-11 rounded-xl font-semibold">
                        <Plus className="mr-2 h-5 w-5" />
                        Nueva Nota de Entrega
                    </Button>
                </Link>
            </div>

            {/* Filters Section */}
            <SalesFilters clientes={clientes} vendedores={vendedores} />

            {/* Table Section */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-zinc-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-zinc-800">
                        <thead className="bg-gray-50/50 dark:bg-zinc-900/50">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">N° Control</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Cliente</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Vendedor</th>
                                <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Estatus</th>
                                <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-zinc-950 divide-y divide-gray-50 dark:divide-zinc-800">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6">
                                            <div className="h-5 bg-gray-50 dark:bg-zinc-900 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : ventas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300">
                                            <div className="p-4 bg-gray-50 dark:bg-zinc-900 rounded-full">
                                                <Search className="h-10 w-10" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-semibold text-gray-500">No se encontraron resultados</p>
                                                <p className="text-sm text-gray-400">Prueba ajustando los filtros de búsqueda.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                ventas.map((venta) => (
                                    <tr key={venta.idVenta} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-all group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                                                {venta.codigoVenta}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-300">
                                            {new Date(venta.fechaVenta).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{venta.Cliente?.nombreCliente || '-'}</div>
                                            <div className="text-xs text-gray-400 font-medium">Cliente Registrado</div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{venta.Vendedor?.nombreVendedor || '-'}</div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-xl ${venta.estatusVenta === 'Completada'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}>
                                                {venta.estatusVenta}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-10 w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-xl transition-all group-hover:scale-110 active:scale-95"
                                                onClick={() => router.push(`/admin/dashboard/ventas/${venta.codigoVenta}`)}
                                                title="Ver Detalles"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pagination Controls */}
            {Math.ceil(totalCount / 10) > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={Number(searchParams.get('page')) || 1}
                        totalPages={Math.ceil(totalCount / 10)}
                        onPageChange={(page) => {
                            const params = new URLSearchParams(searchParams);
                            params.set('page', page.toString());
                            router.replace(`/admin/dashboard/ventas?${params.toString()}`);
                        }}
                    />
                </div>
            )}
        </div>
    );
}

export default function VentasPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto p-4 md:p-8 space-y-8">
                <div className="h-12 bg-gray-100 dark:bg-zinc-900 rounded-xl w-1/4 animate-pulse"></div>
                <div className="h-40 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
                <div className="h-96 bg-gray-100 dark:bg-zinc-900 rounded-2xl animate-pulse"></div>
            </div>
        }>
            <VentasContent />
        </Suspense>
    );
}
