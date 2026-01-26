import { useState, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X, Users, UserCircle } from 'lucide-react';
import { Cliente } from '@/app/clientes/actions';
import { Vendedor } from '@/app/vendedores/actions';
import { useDebouncedCallback } from 'use-debounce';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface SalesFiltersProps {
    clientes: Cliente[];
    vendedores: Vendedor[];
}

function SalesFiltersContent({ clientes, vendedores }: SalesFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [codigoVenta, setCodigoVenta] = useState(searchParams.get('codigoVenta') || '');

    // Memoize options for SearchableSelect
    const clienteOptions = useMemo(() => [
        { value: 'all', label: 'Todos los clientes' },
        ...clientes.map(c => ({ value: c.idCliente.toString(), label: c.nombreCliente }))
    ], [clientes]);

    const vendedorOptions = useMemo(() => [
        { value: 'all', label: 'Todos los vendedores' },
        ...vendedores.map(v => ({ value: v.idVendedor.toString(), label: v.nombreVendedor }))
    ], [vendedores]);

    const updateFilters = useDebouncedCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === 'all' || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    }, 300);

    const handleClear = () => {
        setCodigoVenta('');
        router.push(pathname);
    };

    return (
        <div className="bg-white dark:bg-zinc-950 p-6 rounded-2rem shadow-xl shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-zinc-800 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Código de Venta */}
                <div className="space-y-2.5">
                    <Label htmlFor="codigoVenta" className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">N° Control</Label>
                    <div className="relative group">
                        <Input
                            id="codigoVenta"
                            placeholder="Buscar nota..."
                            value={codigoVenta}
                            onChange={(e) => {
                                setCodigoVenta(e.target.value);
                                updateFilters({ codigoVenta: e.target.value });
                            }}
                            className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                        />
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                </div>

                {/* Cliente */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Filtrar Cliente</Label>
                    <div className="relative group">
                        <UserCircle className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                        <SearchableSelect
                            options={clienteOptions}
                            value={searchParams.get('idCliente') || 'all'}
                            onChange={(value) => updateFilters({ idCliente: value })}
                            placeholder="Todos los clientes"
                            searchPlaceholder="Buscar cliente por nombre..."
                            className="[&>button]:pl-10 h-11"
                        />
                    </div>
                </div>

                {/* Vendedor */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Filtrar Vendedor</Label>
                    <div className="relative group">
                        <Users className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 z-10 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                        <SearchableSelect
                            options={vendedorOptions}
                            value={searchParams.get('idVendedor') || 'all'}
                            onChange={(value) => updateFilters({ idVendedor: value })}
                            placeholder="Todos los vendedores"
                            searchPlaceholder="Buscar vendedor por nombre..."
                            className="[&>button]:pl-10 h-11"
                        />
                    </div>
                </div>

                {/* Fecha Inicio */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Fecha Desde</Label>
                    <Input
                        type="date"
                        value={searchParams.get('startDate') || ''}
                        onChange={(e) => updateFilters({ startDate: e.target.value })}
                        className="h-11 border-gray-200 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                    />
                </div>

                {/* Fecha Fin */}
                <div className="space-y-2.5">
                    <Label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Fecha Hasta</Label>
                    <Input
                        type="date"
                        value={searchParams.get('endDate') || ''}
                        onChange={(e) => updateFilters({ endDate: e.target.value })}
                        className="h-11 border-gray-200 focus:ring-4 focus:ring-blue-500/10 rounded-xl transition-all"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-zinc-900">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all rounded-lg font-bold"
                >
                    <X className="mr-2 h-4 w-4" />
                    Limpiar todos los filtros
                </Button>
            </div>
        </div>
    );
}

export function SalesFilters(props: SalesFiltersProps) {
    return (
        <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-xl" />}>
            <SalesFiltersContent {...props} />
        </Suspense>
    );
}
