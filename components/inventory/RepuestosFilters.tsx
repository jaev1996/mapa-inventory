'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter, Check } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { TipoRepuesto } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface RepuestosFiltersProps {
    tipos: TipoRepuesto[];
}

export function RepuestosFilters({ tipos }: RepuestosFiltersProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // Derived state from URL
    const tipoParam = searchParams.get('tipo') || 'all';
    const lowStockParam = searchParams.get('lowStock') === 'true';
    const searchParam = searchParams.get('search') || '';

    // Local state for search input to allow debouncing
    const [searchTerm, setSearchTerm] = useState(searchParam);
    const [openTipoCombo, setOpenTipoCombo] = useState(false);

    // Sync search input with URL (e.g. back button)
    useEffect(() => {
        setSearchTerm(searchParam);
    }, [searchParam]);

    const updateFilters = useDebouncedCallback((term: string, tipo: string, isLowStock: boolean) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Reset to first page on filter change

        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }

        if (tipo && tipo !== 'all') {
            params.set('tipo', tipo);
        } else {
            params.delete('tipo');
        }

        if (isLowStock) {
            params.set('lowStock', 'true');
        } else {
            params.delete('lowStock');
        }

        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        updateFilters(value, tipoParam, lowStockParam);
    };

    const handleTipoChange = (value: string) => {
        // No local state needed, direct update
        updateFilters(searchTerm, value, lowStockParam);
    };

    const handleLowStockChange = (checked: boolean) => {
        // No local state needed, direct update
        updateFilters(searchTerm, tipoParam, checked);
    };

    const clearFilters = () => {
        setSearchTerm('');
        replace(`${pathname}`);
    };

    const hasActiveFilters = searchParam || (tipoParam && tipoParam !== 'all') || lowStockParam;

    // Determine the label for the selected type
    const selectedTipoLabel = tipos.find(t => t.idTipo.toString() === tipoParam)?.descripTipo;

    return (
        <div className="space-y-4 bg-background p-4 rounded-lg border">
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Buscar por código o descripción..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Tipo Selector with Search (Combobox) */}
                <div className="flex-1 md:max-w-[300px]">
                    <Popover open={openTipoCombo} onOpenChange={setOpenTipoCombo}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openTipoCombo}
                                className="w-full justify-between"
                            >
                                {tipoParam && tipoParam !== 'all'
                                    ? selectedTipoLabel
                                    : "Todos los tipos"}
                                <Filter className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Buscar tipo..." />
                                <CommandList>
                                    <CommandEmpty>No se encontró el tipo.</CommandEmpty>
                                    <CommandGroup>
                                        <CommandItem
                                            value="all"
                                            onSelect={() => {
                                                handleTipoChange('all');
                                                setOpenTipoCombo(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    tipoParam === 'all' ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            Todos los tipos
                                        </CommandItem>
                                        {tipos.map((tipo) => (
                                            <CommandItem
                                                key={tipo.idTipo}
                                                value={tipo.descripTipo} // Use description for filtering
                                                onSelect={() => {
                                                    handleTipoChange(tipo.idTipo.toString());
                                                    setOpenTipoCombo(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        tipoParam === tipo.idTipo.toString() ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {tipo.descripTipo}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Low Stock Checkbox */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="lowStock"
                        checked={lowStockParam}
                        onCheckedChange={handleLowStockChange}
                    />
                    <Label
                        htmlFor="lowStock"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Mostrar stock bajo
                    </Label>
                    {lowStockParam && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 ml-2">
                            ≤ 5 unidades
                        </Badge>
                    )}
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-destructive"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
