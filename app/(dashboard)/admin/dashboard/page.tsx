import { getDashboardStats } from '@/app/actions/dashboard-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard } from 'lucide-react';
import { SalesChart } from '@/components/admin/SalesChart';

export default async function DashboardAdmin() {
    const {
        inventoryValue,
        currentMonthSales,
        topSellers,
        topClients,
        chartData
    } = await getDashboardStats();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(inventoryValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Valor total en repuestos
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{currentMonthSales}</div>
                        <p className="text-xs text-muted-foreground">
                            Transacciones realizadas este mes
                        </p>
                    </CardContent>
                </Card>
                {/* 
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Vendedor Top</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topSellers[0]?.name || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground">
                            {topSellers[0]?.count || 0} ventas
                        </p>
                    </CardContent>
                </Card>
                */}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resumen de Ventas (Anual)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <SalesChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Top Sellers List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Top Vendedores</CardTitle>
                        {/* <CardDescription>Más activos este año.</CardDescription> */}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {topSellers.map((seller, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-gray-100 dark:bg-zinc-800">
                                        <span className="text-xs font-semibold">{seller.name.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{seller.name}</p>
                                        <p className="text-xs text-muted-foreground">Vendedor</p>
                                    </div>
                                    <div className="ml-auto font-medium">+{seller.count} ventas</div>
                                </div>
                            ))}
                            {topSellers.length === 0 && <p className="text-sm text-gray-500">No hay datos disponibles.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Clients List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Clientes Recurrentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {topClients.map((client, index) => (
                                <div key={index} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-blue-100 dark:bg-blue-900">
                                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{client.name.substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{client.name}</p>
                                        <p className="text-xs text-muted-foreground">Cliente</p>
                                    </div>
                                    <div className="ml-auto font-medium">+{client.count} compras</div>
                                </div>
                            ))}
                            {topClients.length === 0 && <p className="text-sm text-gray-500">No hay datos disponibles.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

