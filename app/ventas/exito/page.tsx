'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Printer, Plus, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import ExcelJS from 'exceljs';
import { getVentaDetails } from '@/app/actions/sales-actions';

export default function VentaExitosaPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const codigoVenta = searchParams.get('codigo');
    const [mounted, setMounted] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleExportExcel = async () => {
        if (!codigoVenta) return;
        setIsExporting(true);

        try {
            const venta = await getVentaDetails(codigoVenta);

            if (!venta) {
                alert('No se pudieron cargar los detalles de la venta.');
                setIsExporting(false);
                return;
            }

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

            interface VentaItem {
                cantidadRep: number;
                codigoRep: string;
                precioRep: number;
                subtotalRep: number;
                Repuesto?: {
                    descripRep: string;
                };
            }

            venta.items.forEach((item: VentaItem) => {
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

            // Formula: Subtotal + IVA cell (assuming IVA is next to it, but since it's manual, we might just put the subtotal here or leave it for formula)
            // User asked for "Total que va a tener el mismo valor del subtotal" initially, but also "espacio para calcular el iva de forma manual".
            // If IVA is manual, Total should probably be a formula in Excel = Subtotal + IVA_Cell
            // Let's set it as a formula.
            // Subtotal is at E{currentRowIndex-2}, IVA is at E{currentRowIndex-1}
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
            anchor.download = `Nota_Entrega_${codigoVenta}.xlsx`;
            anchor.click();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Hubo un error al generar el reporte.');
        } finally {
            setIsExporting(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle className="h-20 w-20 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900">¡Venta Exitosa!</h1>

                <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-600">Nota de Entrega N°</p>
                    <p className="text-2xl font-mono font-bold text-blue-600">{codigoVenta}</p>
                </div>

                <p className="text-gray-500">La nota de entrega ha sido creada y guardada correctamente.</p>

                <div className="grid gap-3">
                    <Button
                        onClick={handleExportExcel}
                        disabled={isExporting}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        {isExporting ? 'Generando...' : 'Exportar a Excel'}
                    </Button>

                    <Button onClick={() => router.push('/ventas/nueva')} variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Venta
                    </Button>

                    <Button onClick={() => router.push('/ventas')} variant="ghost" className="w-full">
                        <List className="mr-2 h-4 w-4" />
                        Ver Lista de Ventas
                    </Button>
                </div>
            </div>
        </div>
    );
}
