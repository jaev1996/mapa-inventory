'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getVentas } from '@/app/actions/sales-actions';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';
import Link from 'next/link';

interface Venta {
    idVenta: number;
    codigoVenta: string;
    fechaVenta: string;
    estatusVenta: string;
    tipoPago: string;
    Cliente: { nombreCliente: string };
    Vendedor: { nombreVendedor: string };
    total: number; // We might need to calculate this or fetch it
}

export default function VentasPage() {
    const router = useRouter();
    const [ventas, setVentas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVentas = async () => {
            try {
                const data = await getVentas();
                setVentas(data || []);
            } catch (error) {
                console.error('Error fetching ventas:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVentas();
    }, []);

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Ventas</h1>
                <Link href="/ventas/nueva">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Venta
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Control</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Cargando ventas...</td>
                            </tr>
                        ) : ventas.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay ventas registradas.</td>
                            </tr>
                        ) : (
                            ventas.map((venta) => (
                                <tr key={venta.idVenta} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{venta.codigoVenta}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(venta.fechaVenta).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{venta.Cliente?.nombreCliente || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venta.Vendedor?.nombreVendedor || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${venta.estatusVenta === 'Completada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {venta.estatusVenta}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-blue-600 hover:text-blue-900"
                                            onClick={() => router.push(`/ventas/${venta.codigoVenta}`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
