import { getPagosPendientes, getFacturasConEstado } from '@/app/actions/payment-actions';
import { PanelAprobacion } from '@/components/payments/PanelAprobacion';
import { ListadoFacturas } from '@/components/payments/ListadoFacturas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, Receipt } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCobrosPage() {
    const pagosPendientes = await getPagosPendientes();
    const facturas = await getFacturasConEstado();

    // Calculate statistics
    const totalPagosPendientes = pagosPendientes.length;
    const montoPendienteAprobacion = pagosPendientes.reduce((sum, p: { monto: number }) => sum + (p.monto || 0), 0);
    const facturasPendientes = facturas.filter(f => f.saldoPendiente > 0).length;
    const totalPendienteCobro = facturas.reduce((sum, f) => sum + f.saldoPendiente, 0);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                        <Receipt className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Cobros - Admin</h1>
                        <p className="text-muted-foreground">
                            Apruebe pagos y administre el estado de las facturas
                        </p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <CardDescription>Pagos Pendientes</CardDescription>
                            </div>
                            <CardTitle className="text-3xl text-orange-600">
                                {totalPagosPendientes}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Monto Pendiente Aprobación</CardDescription>
                            <CardTitle className="text-3xl">
                                ${montoPendienteAprobacion.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Facturas con Saldo</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">
                                {facturasPendientes}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total por Cobrar</CardDescription>
                            <CardTitle className="text-3xl text-red-600">
                                ${totalPendienteCobro.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="pendientes" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="pendientes" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pagos Pendientes
                            {totalPagosPendientes > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs bg-orange-600 text-white rounded-full">
                                    {totalPagosPendientes}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="facturas" className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Todas las Facturas
                        </TabsTrigger>
                    </TabsList>

                    {/* Pending Payments Tab */}
                    <TabsContent value="pendientes" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pagos Pendientes de Aprobación</CardTitle>
                                <CardDescription>
                                    Revise y apruebe o rechace los pagos registrados por los clientes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PanelAprobacion pagosPendientes={pagosPendientes} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* All Invoices Tab */}
                    <TabsContent value="facturas" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Estado de Todas las Facturas</CardTitle>
                                <CardDescription>
                                    Visualice el estado de pago de todas las facturas del sistema
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ListadoFacturas facturas={facturas} mostrarAcciones={true} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
