'use server';

import { supabase } from '@/utils/supabase';

export async function getDashboardStats() {
    try {
        // 1. Inventory Value & Count
        // Fetch all repuestos to sum (qty * price). 
        // If dataset is huge, this should be an RPC, but for now we calculate in app.
        const { data: repuestos, error: repError } = await supabase
            .from('repuestos')
            .select('cantidadRep, precioRep');

        if (repError) throw repError;

        const inventoryValue = repuestos.reduce((acc, item) => {
            return acc + (item.cantidadRep * item.precioRep);
        }, 0);

        // 2. Date Range Setup (Current Month & Last 12 Months)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfYear = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString(); // 12 months ago

        // 3. Sales Data
        // We need sales to count monthly sales and build the chart
        // We also need vendor and client info for the "Tops"

        // Fetch Ventas from last 12 months
        const { data: ventas, error: ventasError } = await supabase
            .from('ventas')
            .select(`
        idVenta,
        codigoVenta,
        fechaVenta,
        idVendedor,
        idCliente,
        Vendedor:vendedor (nombreVendedor),
        Cliente:cliente (nombreCliente)
      `)
            .gte('fechaVenta', startOfYear)
            .order('fechaVenta', { ascending: true });

        if (ventasError) throw ventasError;

        // Fetch HistoricoVentas for these sales to calculate totals (Revenue)
        // We need the totals for the chart.
        // Optimization: Get all historico items where codigoVenta is in our fetched ventas list.
        const codigosVenta = ventas.map(v => v.codigoVenta);

        // Chunking might be needed if too many, but assuming reasonable limits for this demo
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let historicos: any[] = [];
        if (codigosVenta.length > 0) {
            const { data: histData, error: histError } = await supabase
                .from('historicoventas')
                .select('codigoVenta, subtotalRep')
                .in('codigoVenta', codigosVenta);

            if (histError) throw histError;
            historicos = histData;
        }

        // --- Processing Data ---

        // A. Monthly Sales Count (Current Month)
        const currentMonthSales = ventas.filter(v => v.fechaVenta >= startOfMonth).length;

        // B. Top Sellers (by # of sales in the last 12 months, or all time? User asked "More active", implied recent usually, but could be all time. Let's use the fetched 12-month window for relevance)
        const sellerMap = new Map<string, number>();
        ventas.forEach(v => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const name = (v.Vendedor as any)?.nombreVendedor || 'Desconocido';
            sellerMap.set(name, (sellerMap.get(name) || 0) + 1);
        });

        const topSellers = Array.from(sellerMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // C. Top Clients (Recurring)
        const clientMap = new Map<string, number>();
        ventas.forEach(v => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const name = (v.Cliente as any)?.nombreCliente || 'Desconocido';
            clientMap.set(name, (clientMap.get(name) || 0) + 1);
        });

        const topClients = Array.from(clientMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // D. Yearly Chart Data (Revenue per Month)
        // 1. Map historico items to sales to get Sale Total
        const saleTotals = new Map<string, number>();
        historicos.forEach(h => {
            saleTotals.set(h.codigoVenta, (saleTotals.get(h.codigoVenta) || 0) + h.subtotalRep);
        });

        // 2. Aggregate by Month
        // Initialize last 12 months with 0
        const chartDataMap = new Map<string, number>();

        // Better: Create array of keys first to ensure order?
        const months: string[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const name = d.toLocaleString('default', { month: 'short' }); // "ene"
            months.push(name);
            chartDataMap.set(name, 0); // Init
        }

        ventas.forEach(v => {
            const date = new Date(v.fechaVenta);
            const name = date.toLocaleString('default', { month: 'short' });
            if (chartDataMap.has(name)) {
                const total = saleTotals.get(v.codigoVenta) || 0;
                chartDataMap.set(name, (chartDataMap.get(name) || 0) + total);
            }
        });

        const chartData = Array.from(chartDataMap.entries()).map(([name, total]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
            total: total
        }));

        return {
            inventoryValue,
            currentMonthSales,
            topSellers,
            topClients,
            chartData
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            inventoryValue: 0,
            currentMonthSales: 0,
            topSellers: [],
            topClients: [],
            chartData: []
        };
    }
}
