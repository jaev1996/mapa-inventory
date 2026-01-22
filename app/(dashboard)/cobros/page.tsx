import { getFacturasConEstado } from '@/app/actions/payment-actions';
import { ListadoFacturas } from '@/components/payments/ListadoFacturas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CobrosPage() {
    const facturas = await getFacturasConEstado();

    // Calculate statistics
    const totalFacturas = facturas.length;
    const facturasPendientes = facturas.filter(f => f.saldoPendiente > 0).length;
    const totalPendiente = facturas.reduce((sum, f) => sum + f.saldoPendiente, 0);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Receipt className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Cobros</h1>
                        <p className="text-muted-foreground">
                            Administre los pagos de sus facturas
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total de Facturas</CardDescription>
                            <CardTitle className="text-3xl">{totalFacturas}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Facturas con Saldo Pendiente</CardDescription>
                            <CardTitle className="text-3xl text-orange-600">
                                {facturasPendientes}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Pendiente de Pago</CardDescription>
                            <CardTitle className="text-3xl text-red-600">
                                ${totalPendiente.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Invoices List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Facturas Pendientes</CardTitle>
                        <CardDescription>
                            Listado de todas las facturas con su estado de pago
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ListadoFacturas facturas={facturas} mostrarAcciones={true} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
