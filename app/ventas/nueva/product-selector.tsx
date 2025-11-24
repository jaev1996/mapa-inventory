'use client';

import { useState, useEffect, useCallback } from 'react';
import { Repuesto, TipoRepuesto } from '@/lib/types';
import { getRepuestos, getAllTipos } from '@/app/actions/inventory-actions';

interface ProductSelectorProps {
    onAddProduct: (product: Repuesto) => void;
}

export default function ProductSelector({ onAddProduct }: ProductSelectorProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<number | 'all'>('all');
    const [lowStock, setLowStock] = useState(false);
    const [products, setProducts] = useState<Repuesto[]>([]);
    const [tipos, setTipos] = useState<TipoRepuesto[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Initial load of types
    useEffect(() => {
        getAllTipos().then(setTipos).catch(console.error);
    }, []);

    // Search function
    const searchProducts = useCallback(async () => {
        // Don't search if empty unless filtering by type or low stock
        if (!searchTerm && selectedType === 'all' && !lowStock) {
            setProducts([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);
        try {
            const { data } = await getRepuestos(1, 50, searchTerm, lowStock);

            let filtered = data;
            if (selectedType !== 'all') {
                filtered = filtered.filter(p => p.idTipo === selectedType);
            }
            setProducts(filtered);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedType, lowStock]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchProducts]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Buscar Repuestos</h3>

            <div className="flex flex-col gap-4 mb-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Buscar por código o descripción..."
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-1/3">
                        <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        >
                            <option value="all">Todos los tipos</option>
                            {tipos.map(tipo => (
                                <option key={tipo.idTipo} value={tipo.idTipo}>
                                    {tipo.descripTipo}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="lowStock"
                        checked={lowStock}
                        onChange={(e) => setLowStock(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lowStock" className="ml-2 block text-sm text-gray-900">
                        Mostrar solo stock bajo (≤ 5)
                    </label>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {loading ? (
                    <p className="text-center text-gray-500 py-4">Buscando...</p>
                ) : !hasSearched ? (
                    <p className="text-center text-gray-500 py-4">Ingrese un término de búsqueda o seleccione un filtro.</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No se encontraron repuestos.</p>
                ) : (
                    <div className="grid gap-2">
                        {products.map(product => (
                            <div
                                key={product.idRep}
                                className={`flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer`}
                                onClick={() => onAddProduct(product)}
                            >
                                <div>
                                    <p className="font-medium text-gray-900">{product.descripRep}</p>
                                    <p className="text-sm text-gray-500">Código: {product.codigoRep} | Stock: {product.cantidadRep}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-blue-600">${product.precioRep.toFixed(2)}</span>
                                    <button
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
