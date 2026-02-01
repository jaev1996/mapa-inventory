'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClientes, Cliente } from '@/app/clientes/actions';
import { getVendedores, Vendedor } from '@/app/vendedores/actions';
import { getNextVentaId, createVenta } from '@/app/actions/sales-actions';
import { Repuesto } from '@/lib/types';
import ProductSelector from './product-selector';
import CartSummary from './cart-summary';
import DeliveryNotePreview from './delivery-note-preview';

interface CartItem {
    codigoRep: string;
    descripRep: string;
    cantidadRep: number;
    precioRep: number;
    subtotalRep: number;
    maxStock: number;
}

export default function NuevaVentaPage() {
    const router = useRouter();
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [codigoVenta, setCodigoVenta] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tipoPago, setTipoPago] = useState('Contado');

    useEffect(() => {
        getClientes(1, 1000).then(res => setClientes(res.data)).catch(console.error);
        getVendedores(1, 1000).then(res => setVendedores(res.data)).catch(console.error);
        getNextVentaId().then(setCodigoVenta).catch(console.error);
    }, []);

    const handleAddProduct = (product: Repuesto) => {
        setCart(prev => {
            const existing = prev.find(item => item.codigoRep === product.codigoRep);
            if (existing) {
                if (existing.cantidadRep < product.cantidadRep) {
                    return prev.map(item =>
                        item.codigoRep === product.codigoRep
                            ? { ...item, cantidadRep: item.cantidadRep + 1, subtotalRep: (item.cantidadRep + 1) * item.precioRep }
                            : item
                    );
                }
                return prev; // Max stock reached
            }
            return [...prev, {
                codigoRep: product.codigoRep,
                descripRep: product.descripRep,
                cantidadRep: 1,
                precioRep: product.precioRep,
                subtotalRep: product.precioRep,
                maxStock: product.cantidadRep
            }];
        });
    };

    const handleUpdateQuantity = (codigoRep: string, newQuantity: number) => {
        setCart(prev => prev.map(item => {
            if (item.codigoRep === codigoRep) {
                const quantity = Math.min(Math.max(1, newQuantity), item.maxStock);
                return {
                    ...item,
                    cantidadRep: quantity,
                    subtotalRep: quantity * item.precioRep
                };
            }
            return item;
        }));
    };

    const handleRemoveItem = (codigoRep: string) => {
        setCart(prev => prev.filter(item => item.codigoRep !== codigoRep));
    };

    const handleConfirmSale = async () => {
        if (!selectedCliente) return;
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('codigoVenta', codigoVenta);
        formData.append('idCliente', selectedCliente.idCliente.toString());
        formData.append('idVendedor', selectedCliente.idVendedor.toString());
        formData.append('tipoPago', tipoPago);
        formData.append('items', JSON.stringify(cart));

        try {
            const result = await createVenta(null, formData);
            if (result.message === 'success') {
                router.push(`/admin/dashboard/ventas/exito?codigo=${codigoVenta}`);
            } else {
                alert('Error: ' + result.message);
                if (result.errors) {
                    console.error(result.errors);
                }
            }
        } catch (error) {
            console.error('Error submitting sale:', error);
            alert('Ocurrió un error inesperado.');
        } finally {
            setIsSubmitting(false);
            setShowPreview(false);
        }
    };

    const total = cart.reduce((sum, item) => sum + item.subtotalRep, 0);

    const getSellerDetails = (idVendedor: number) => {
        const vendedor = vendedores.find(v => v.idVendedor === idVendedor);
        if (vendedor) {
            return `${vendedor.nombreVendedor} (${vendedor.codigoVendedor})`;
        }
        return `ID: ${idVendedor}`;
    };

    return (
        <div className="container mx-auto p-6 max-w-[1600px]">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Nueva Nota de Entrega</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-500">N° de Control</p>
                    <p className="text-xl font-mono font-bold text-blue-600">{codigoVenta || 'Cargando...'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Client & Product Selection */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Client Selection */}
                    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Datos del Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={selectedCliente?.idCliente || ''}
                                    onChange={(e) => {
                                        const client = clientes.find(c => c.idCliente === Number(e.target.value));
                                        setSelectedCliente(client || null);
                                    }}
                                >
                                    <option value="">Seleccione un cliente...</option>
                                    {clientes.map(client => (
                                        <option key={client.idCliente} value={client.idCliente}>
                                            {client.nombreCliente}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Pago</label>
                                <select
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    value={tipoPago}
                                    onChange={(e) => setTipoPago(e.target.value)}
                                >
                                    <option value="Contado">Contado</option>
                                    <option value="Crédito">Crédito</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>
                        </div>
                        {selectedCliente && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
                                <p><strong>Dirección:</strong> {selectedCliente.direccionCliente}</p>
                                <p><strong>Vendedor Asignado:</strong> {getSellerDetails(selectedCliente.idVendedor)}</p>
                            </div>
                        )}
                    </div>

                    {/* Product Selector */}
                    <ProductSelector onAddProduct={handleAddProduct} />
                </div>

                {/* Right Column: Cart Summary */}
                <div className="lg:col-span-4">
                    <CartSummary
                        items={cart}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                    />

                    <button
                        disabled={cart.length === 0 || !selectedCliente}
                        onClick={() => setShowPreview(true)}
                        className="w-full mt-4 py-3 px-4 bg-green-600 text-white font-bold rounded-lg shadow hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        Vista Previa y Confirmar
                    </button>
                </div>
            </div>

            {showPreview && (
                <DeliveryNotePreview
                    client={selectedCliente}
                    sellerName={selectedCliente ? getSellerDetails(selectedCliente.idVendedor) : ''}
                    items={cart}
                    total={total}
                    onConfirm={handleConfirmSale}
                    onCancel={() => setShowPreview(false)}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
}
