'use server'

import ExcelJS from 'exceljs';
import { createClient } from '@/lib/supabase/server';
import { Repuesto } from '@/lib/types';

export async function generateInventoryExcel() {
    const supabase = await createClient();

    // 1. Fetch data
    // We want items with quantity > 0 as per user requirement (implied by "if it has items available")
    const { data, error } = await supabase
        .from('repuestos')
        .select(`
            *,
            MarcaRepuesto:marcarepuesto (descripMarca),
            TipoRepuesto:tiporepuesto (descripTipo)
        `)
        .gt('cantidadRep', 0)
        .order('codigoRep', { ascending: true });

    if (error) {
        console.error('Error fetching data for report:', error);
        throw new Error('Error al obtener los datos para el reporte');
    }

    const repuestos = data as Repuesto[];

    // 2. Group by category
    const groupedData: Record<string, Repuesto[]> = {};
    repuestos.forEach(rep => {
        const category = rep.TipoRepuesto?.descripTipo || 'SIN CATEGORÍA';
        if (!groupedData[category]) {
            groupedData[category] = [];
        }
        groupedData[category].push(rep);
    });

    // 3. Sort categories alphabetically
    const sortedCategories = Object.keys(groupedData)
        .filter(cat => groupedData[cat].length > 0)
        .sort((a, b) => a.localeCompare(b));

    // 4. Create Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    // 5. Column widths 
    // Further refined to fit perfectly on a Letter size sheet
    worksheet.columns = [
        { header: 'Codigo', key: 'codigo', width: 14 },
        { header: 'Descripcion', key: 'descripcion', width: 50 },
        { header: 'Marca', key: 'marca', width: 10 },
        { header: 'Cant.', key: 'cantidad', width: 6 },
        { header: 'Precio', key: 'precio', width: 8 },
    ];

    // 6. Header Rows
    // Row 1: Company Name
    worksheet.mergeCells('A1:E1');
    const companyCell = worksheet.getCell('A1');
    companyCell.value = 'MAPA MAYOR DE AUTORPARTES C.A.';
    companyCell.font = { name: 'Arial', size: 14, bold: true };
    companyCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Row 2: RIF
    worksheet.mergeCells('A2:E2');
    const rifCell = worksheet.getCell('A2');
    rifCell.value = 'RIF.J-412365126';
    rifCell.font = { name: 'Arial', size: 11, bold: true };
    rifCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Row 3: Table Headers
    const headerRow = worksheet.getRow(3);
    headerRow.values = ['Codigo', 'Descripcion', 'Marca', 'Cant.', 'Precio'];
    headerRow.eachCell((cell) => {
        cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2563EB' } // Blue-600
        };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
    headerRow.height = 20;

    let currentRow = 4;

    // 7. Add Data by Category
    sortedCategories.forEach(category => {
        const items = groupedData[category];

        // Category Header Row
        worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
        const catCell = worksheet.getCell(`A${currentRow}`);
        catCell.value = category.toUpperCase();
        catCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1E40AF' } };
        catCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' } // White background for categories
        };
        catCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        catCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getRow(currentRow).height = 22;
        currentRow++;

        // Items
        items.forEach(item => {
            const row = worksheet.getRow(currentRow);
            row.values = [
                item.codigoRep,
                item.descripRep,
                item.MarcaRepuesto?.descripMarca || 'N/A',
                item.cantidadRep,
                item.precioRep
            ];

            // Formatting
            row.getCell(1).font = { name: 'Arial', size: 9 };
            row.getCell(2).font = { name: 'Arial', size: 9 };
            row.getCell(2).alignment = { wrapText: true, vertical: 'middle' }; // wrapText is key for auto-expanding height
            row.getCell(3).font = { name: 'Arial', size: 9 };
            row.getCell(4).font = { name: 'Arial', size: 9 };
            row.getCell(5).font = { name: 'Arial', size: 9, bold: true };

            row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
            row.getCell(5).alignment = { horizontal: 'right', vertical: 'middle' };
            row.getCell(5).numFmt = '"$"#,##0.00';

            // Alternating row background
            if (currentRow % 2 === 0) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' }
                    };
                });
            }

            // Borders for ALL cells in data row
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            // We do NOT set a manual row.height here to allow the content to auto-fit
            currentRow++;
        });
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer).toString('base64');
}
