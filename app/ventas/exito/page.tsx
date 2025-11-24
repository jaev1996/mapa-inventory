'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Printer, Plus, List } from 'lucide-react';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export default function VentaExitosaPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const codigoVenta = searchParams.get('codigo');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleExportExcel = () => {
        // In a real app, you'd fetch the full sale details here.
        // For now, we'll just export basic info or a placeholder.
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { Nota: codigoVenta, Estado: 'Creada Exitosamente', Fecha: new Date().toLocaleDateString() }
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Nota de Entrega");
        XLSX.writeFile(wb, `Nota_Entrega_${codigoVenta}.xlsx`);
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
                    <Button onClick={handleExportExcel} className="w-full bg-green-600 hover:bg-green-700">
                        <Printer className="mr-2 h-4 w-4" />
                        Exportar a Excel
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
