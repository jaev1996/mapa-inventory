'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getVentaDetails } from '@/app/actions/sales-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Plus, List } from 'lucide-react';
import * as XLSX from 'xlsx';

interface VentaItem {
    codigoRep: string;
    cantidadRep: number;
    precioRep: number;
    subtotalRep: number;
    Repuesto?: { descripRep: string };
}

interface VentaDetails {
    codigoVenta: string;
    fechaVenta: string;
    tipoPago: string;
    estatusVenta: string;
    Cliente: {
        nombreCliente: string;
        direccionCliente: string;
        telefonoCliente: string;
        codigoCliente: string;
    };
    Vendedor: {
        nombreVendedor: string;
        codigoVendedor: string;
        telefonoVendedor: string;
    };
    items: VentaItem[];
}

export default function VentaDetallesPage() {
    const params = useParams();
    const router = useRouter();
    const codigoVenta = params.codigo as string;
    const [venta, setVenta] = useState<VentaDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVenta = async () => {
            try {
                const data = await getVentaDetails(codigoVenta);
                setVenta(data);
            } catch (error) {
                console.error('Error fetching venta details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVenta();
    }, [codigoVenta]);

    const handleExportExcel = () => {
        if (!venta) return;

        const total = venta.items.reduce((sum, item) => sum + item.subtotalRep, 0);

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Header info
        const headerData = [
            ['NOTA DE ENTREGA'],
            [''],
            ['N° Control:', venta.codigoVenta],
            ['Fecha:', new Date(venta.fechaVenta).toLocaleDateString()],
            ['Tipo de Pago:', venta.tipoPago],
            ['Estatus:', venta.estatusVenta],
            [''],
            ['DATOS DEL CLIENTE'],
            ['Cliente:', venta.Cliente.nombreCliente],
            ['Código:', venta.Cliente.codigoCliente],
            ['Dirección:', venta.Cliente.direccionCliente],
            ['Teléfono:', venta.Cliente.telefonoCliente],
            [''],
            ['VENDEDOR'],
            ['Nombre:', venta.Vendedor.nombreVendedor],
            ['Código:', venta.Vendedor.codigoVendedor],
            ['Teléfono:', venta.Vendedor.telefonoVendedor],
            [''],
            ['ITEMS'],
        ];

        // Items table
        const itemsData = venta.items.map(item => ({
            Código: item.codigoRep,
            Descripción: item.Repuesto?.descripRep || '-',
            Cantidad: item.cantidadRep,
            'Precio Unit.': item.precioRep,
            Subtotal: item.subtotalRep,
        }));

        // Combine all data
        const ws = XLSX.utils.aoa_to_sheet(headerData);
        XLSX.utils.sheet_add_json(ws, itemsData, { origin: -1, skipHeader: false });

        // Add total
        XLSX.utils.sheet_add_aoa(ws, [['', '', '', 'TOTAL:', total]], { origin: -1 });

        XLSX.utils.book_append_sheet(wb, ws, 'Nota de Entrega');
        XLSX.writeFile(wb, `Nota_Entrega_${venta.codigoVenta}.xlsx`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Cargando detalles de la venta...</p>
            </div>
        );
    }

    if (!venta) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">No se encontró la venta.</p>
                    <Button onClick={() => router.push('/ventas')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Ventas
                    </Button>
                </div>
            </div>
        );
    }

    const total = venta.items.reduce((sum, item) => sum + item.subtotalRep, 0);

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" onClick={() => router.push('/ventas')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>

                <div className="flex gap-2">
                    <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700">
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </Button>
                    <Button onClick={() => router.push('/ventas/nueva')} variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Venta
                    </Button>
                    <Button onClick={() => router.push('/ventas')} variant="outline">
                        <List className="mr-2 h-4 w-4" />
                        Lista de Ventas
                    </Button>
                </div>
            </div>

            {/* Sale Details Card */}
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                {/* Header */}
                <div className="border-b pb-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Nota de Entrega</h1>
                            <p className="text-gray-500 mt-1">Detalles de la venta</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">N° de Control</p>
                            <p className="text-2xl font-mono font-bold text-blue-600">{venta.codigoVenta}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {new Date(venta.fechaVenta).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Client and Seller Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Datos del Cliente</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Nombre:</span> {venta.Cliente.nombreCliente}</p>
                            <p><span className="font-medium">Código:</span> {venta.Cliente.codigoCliente}</p>
                            <p><span className="font-medium">Dirección:</span> {venta.Cliente.direccionCliente}</p>
                            <p><span className="font-medium">Teléfono:</span> {venta.Cliente.telefonoCliente}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Vendedor Asignado</h3>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Nombre:</span> {venta.Vendedor.nombreVendedor}</p>
                            <p><span className="font-medium">Código:</span> {venta.Vendedor.codigoVendedor}</p>
                            <p><span className="font-medium">Teléfono:</span> {venta.Vendedor.telefonoVendedor}</p>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="flex gap-4">
                    <div className="bg-gray-50 px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-600">Tipo de Pago: </span>
                        <span className="font-semibold">{venta.tipoPago}</span>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-600">Estatus: </span>
                        <span className="font-semibold text-green-700">{venta.estatusVenta}</span>
                    </div>
                </div>

                {/* Items Table */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Items de la Venta</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Código</th>
                                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700">Descripción</th>
                                    <th className="border border-gray-200 px-4 py-2 text-center text-sm font-medium text-gray-700">Cantidad</th>
                                    <th className="border border-gray-200 px-4 py-2 text-right text-sm font-medium text-gray-700">Precio Unit.</th>
                                    <th className="border border-gray-200 px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {venta.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="border border-gray-200 px-4 py-2 text-sm">{item.codigoRep}</td>
                                        <td className="border border-gray-200 px-4 py-2 text-sm">{item.Repuesto?.descripRep || '-'}</td>
                                        <td className="border border-gray-200 px-4 py-2 text-sm text-center">{item.cantidadRep}</td>
                                        <td className="border border-gray-200 px-4 py-2 text-sm text-right">${item.precioRep.toFixed(2)}</td>
                                        <td className="border border-gray-200 px-4 py-2 text-sm text-right font-semibold">${item.subtotalRep.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={4} className="border border-gray-200 px-4 py-3 text-right font-bold text-gray-900">TOTAL:</td>
                                    <td className="border border-gray-200 px-4 py-3 text-right font-bold text-xl text-blue-600">${total.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
