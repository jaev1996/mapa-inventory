import { getAuditLogs } from "@/app/actions/sales-actions";
import { AuditTable } from "@/components/sales/AuditTable";
import { AuditFilters } from "@/components/sales/AuditFilters";
import { ClipboardList, ShieldCheck } from "lucide-react";

interface PageProps {
    searchParams: Promise<{
        codigo?: string;
        usuario?: string;
    }>;
}

export default async function AuditPage({ searchParams }: PageProps) {
    const filters = await searchParams;

    const { data: logs } = await getAuditLogs(1, 100, {
        codigoVenta: filters.codigo,
        usuario: filters.usuario
    });

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                        Auditoría de Ventas
                    </h2>
                    <p className="text-muted-foreground">
                        Historial completo de modificaciones en notas de entrega, cambios de stock y acciones de usuario.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-blue-700 text-sm">
                    <ClipboardList className="h-5 w-5" />
                    <span>Se registran todas las ediciones manuales.</span>
                </div>
            </div>

            <AuditFilters />

            <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6">
                    <AuditTable logs={logs || []} />
                </div>
            </div>
        </div>
    );
}
