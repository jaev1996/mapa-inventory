'use client';

import { HistoricoVenta } from '@/lib/types';

interface CartItem extends Omit<HistoricoVenta, 'idHistorico' | 'codigoVenta'> {
    descripRep: string; // Helper for display
    maxStock: number; // Helper for validation
}

interface CartSummaryProps {
    items: CartItem[];
    onUpdateQuantity: (codigoRep: string, newQuantity: number) => void;
    onRemoveItem: (codigoRep: string) => void;
}

export default function CartSummary({ items, onUpdateQuantity, onRemoveItem }: CartSummaryProps) {
    const total = items.reduce((sum, item) => sum + item.subtotalRep, 0);

    return (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 h-full flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Resumen de Nota de Entrega</h3>

            <div className="flex-1 overflow-y-auto mb-4">
                {items.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No hay items agregados.</p>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-3 py-2">Descripción</th>
                                <th className="px-3 py-2 text-center">Cant.</th>
                                <th className="px-3 py-2 text-right">Precio</th>
                                <th className="px-3 py-2 text-right">Subtotal</th>
                                <th className="px-3 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.codigoRep} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2 font-medium text-gray-900">
                                        {item.descripRep}
                                        <div className="text-xs text-gray-500">{item.codigoRep}</div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.maxStock}
                                            value={item.cantidadRep}
                                            onChange={(e) => onUpdateQuantity(item.codigoRep, parseInt(e.target.value) || 1)}
                                            className="w-16 p-1 border rounded text-center"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right">${item.precioRep.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right font-semibold">${item.subtotalRep.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={() => onRemoveItem(item.codigoRep)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
