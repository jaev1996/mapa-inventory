'use client';

import { Cliente } from '@/app/clientes/actions';
import { HistoricoVenta } from '@/lib/types';

interface CartItem extends Omit<HistoricoVenta, 'idHistorico' | 'codigoVenta'> {
    descripRep: string;
}

interface DeliveryNotePreviewProps {
    client: Cliente | null;
    sellerName: string;
    items: CartItem[];
    total: number;
    onConfirm: () => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export default function DeliveryNotePreview({
    client,
    sellerName,
    items,
    total,
    onConfirm,
    onCancel,
    isSubmitting
}: DeliveryNotePreviewProps) {
    if (!client) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Vista Previa de Nota de Entrega</h2>
                </div>

                <div className="p-6 space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Cliente</h3>
                            <p className="text-lg font-semibold text-gray-900">{client.nombreCliente}</p>
                            <p className="text-sm text-gray-600">{client.codigoCliente}</p>
                            <p className="text-sm text-gray-600">{client.direccionCliente}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-sm font-medium text-gray-500">Vendedor</h3>
                            <p className="text-lg font-semibold text-gray-900">{sellerName}</p>
                            <h3 className="text-sm font-medium text-gray-500 mt-2">Fecha</h3>
                            <p className="text-gray-900">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-3 py-2">Código</th>
                                <th className="px-3 py-2">Descripción</th>
                                <th className="px-3 py-2 text-center">Cant.</th>
                                <th className="px-3 py-2 text-right">Precio</th>
                                <th className="px-3 py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.codigoRep} className="border-b">
                                    <td className="px-3 py-2 text-gray-600">{item.codigoRep}</td>
                                    <td className="px-3 py-2 font-medium text-gray-900">{item.descripRep}</td>
                                    <td className="px-3 py-2 text-center">{item.cantidadRep}</td>
                                    <td className="px-3 py-2 text-right">${item.precioRep.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-right font-semibold">${item.subtotalRep.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total */}
                    <div className="flex justify-end border-t pt-4">
                        <div className="text-right">
                            <span className="text-gray-600 text-lg mr-4">Total a Pagar:</span>
                            <span className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-4 rounded-b-lg">
                    <button
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Procesando...
                            </>
                        ) : (
                            'Confirmar Nota de Entrega'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
