'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getVentaDetails } from '@/app/actions/sales-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import ExcelJS from 'exceljs';
import { EditVentaForm } from '@/components/sales/EditVentaForm';

interface VentaItem {
    codigoRep: string;
    cantidadRep: number;
    precioRep: number;
    subtotalRep: number;
    Repuesto?: { descripRep: string };
}

interface VentaDetails {
    idVenta: number;
    codigoVenta: string;
    fechaVenta: string;
    tipoPago: string;
    estatusVenta: string;
    idCliente: number;
    idVendedor: number;
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
    const [isExporting, setIsExporting] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const fetchVenta = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getVentaDetails(codigoVenta);
            setVenta(data);
        } catch (error) {
            console.error('Error fetching venta details:', error);
        } finally {
            setLoading(false);
        }
    }, [codigoVenta]);

    useEffect(() => {
        fetchVenta();
    }, [fetchVenta]);

    const handleExportExcel = async () => {
        // ... existing export logic ...
        if (!venta) return;
        setIsExporting(true);

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Nota de Entrega');

            // --- Styling Constants ---
            const borderStyle: Partial<ExcelJS.Borders> = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };

            const centeredStyle: Partial<ExcelJS.Alignment> = { vertical: 'middle', horizontal: 'center' };
            const titleFont = { name: 'Arial', size: 14, bold: true };
            const headerFont = { name: 'Arial', size: 10, bold: true };
            const normalFont = { name: 'Arial', size: 10 };

            // --- Header ---
            // Title
            worksheet.mergeCells('A1:E1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'MAPA MAYOR DE AUTOPARTES';
            titleCell.font = titleFont;
            titleCell.alignment = centeredStyle;

            // Client & Seller Info
            worksheet.getCell('A3').value = `Cliente: ${venta.Cliente?.nombreCliente || 'N/A'}`;
            worksheet.getCell('A3').font = normalFont;

            worksheet.getCell('D3').value = `NE: ${venta.codigoVenta}`;
            worksheet.getCell('D3').font = { ...normalFont, bold: true };
            worksheet.getCell('D3').alignment = { horizontal: 'right' };
            worksheet.mergeCells('D3:E3');

            worksheet.getCell('A4').value = `Dirección: ${venta.Cliente?.direccionCliente || 'N/A'}`;
            worksheet.getCell('A4').font = normalFont;

            worksheet.getCell('A5').value = `Vendedor: ${venta.Vendedor?.nombreVendedor || 'N/A'}`;
            worksheet.getCell('A5').font = normalFont;

            // --- Table Headers ---
            const headerRowIndex = 7;
            const headers = ['Cant', 'Código', 'Descripción', 'Precio', 'Total'];
            const headerRow = worksheet.getRow(headerRowIndex);

            // Set column widths
            worksheet.getColumn('A').width = 10; // Cant
            worksheet.getColumn('B').width = 15; // Código
            worksheet.getColumn('C').width = 40; // Descripción
            worksheet.getColumn('D').width = 15; // Precio
            worksheet.getColumn('E').width = 15; // Total

            headerRow.values = headers;
            headerRow.eachCell((cell) => {
                cell.font = headerFont;
                cell.border = borderStyle;
                cell.alignment = centeredStyle;
            });

            // --- Items ---
            let currentRowIndex = 8;
            let subtotal = 0;

            venta.items.forEach((item) => {
                const row = worksheet.getRow(currentRowIndex);
                row.values = [
                    item.cantidadRep,
                    item.codigoRep,
                    item.Repuesto?.descripRep || 'Item desconocido',
                    item.precioRep,
                    item.subtotalRep
                ];

                // Formatting
                row.getCell(1).alignment = centeredStyle; // Cant
                row.getCell(2).alignment = { ...centeredStyle, horizontal: 'left' }; // Código
                row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' }; // Descrip
                row.getCell(4).numFmt = '#,##0.00'; // Precio
                row.getCell(5).numFmt = '#,##0.00'; // Total

                // Borders
                row.eachCell((cell) => {
                    cell.border = borderStyle;
                    cell.font = normalFont;
                });

                subtotal += item.subtotalRep;
                currentRowIndex++;
            });

            // --- Footer ---
            currentRowIndex++; // Space

            // Subtotal
            const subtotalRow = worksheet.getRow(currentRowIndex);
            subtotalRow.getCell(4).value = 'Subtotal:';
            subtotalRow.getCell(4).font = headerFont;
            subtotalRow.getCell(4).alignment = { horizontal: 'right' };

            subtotalRow.getCell(5).value = subtotal;
            subtotalRow.getCell(5).numFmt = '#,##0.00';
            subtotalRow.getCell(5).font = headerFont;
            subtotalRow.getCell(5).border = borderStyle;

            currentRowIndex++;

            // IVA (Manual)
            const ivaRow = worksheet.getRow(currentRowIndex);
            ivaRow.getCell(4).value = 'IVA:';
            ivaRow.getCell(4).font = headerFont;
            ivaRow.getCell(4).alignment = { horizontal: 'right' };

            ivaRow.getCell(5).border = borderStyle; // Empty box for manual input

            currentRowIndex++;

            // Total
            const totalRow = worksheet.getRow(currentRowIndex);
            totalRow.getCell(4).value = 'Total:';
            totalRow.getCell(4).font = headerFont;
            totalRow.getCell(4).alignment = { horizontal: 'right' };

            // Formula: Subtotal + IVA cell
            const subtotalCellRef = `E${currentRowIndex - 2}`;
            const ivaCellRef = `E${currentRowIndex - 1}`;
            totalRow.getCell(5).value = { formula: `${subtotalCellRef}+${ivaCellRef}`, result: subtotal };
            totalRow.getCell(5).numFmt = '#,##0.00';
            totalRow.getCell(5).font = headerFont;
            totalRow.getCell(5).border = borderStyle;


            // Generate and Download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `Nota_Entrega_${venta.codigoVenta}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Hubo un error al generar el reporte.');
        } finally {
            setIsExporting(false);
        }
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
                    <Button onClick={() => router.push('/admin/dashboard/ventas')}>
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
                <Button variant="ghost" onClick={() => router.push('/admin/dashboard/ventas')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Button>

                <div className="flex gap-2">
                    {!isEditing && (
                        <>
                            <Button
                                onClick={handleExportExcel}
                                disabled={isExporting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {isExporting ? 'Generando...' : 'Exportar Excel'}
                            </Button>
                            <Button onClick={() => setIsEditing(true)} variant="outline">
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar Venta
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <EditVentaForm
                    venta={venta}
                    onCancel={() => setIsEditing(false)}
                    onSuccess={() => {
                        setIsEditing(false);
                        fetchVenta(); // Reload data
                    }}
                />
            ) : (
                /* Sale Details Card */
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
            )}
        </div>
    );
}
