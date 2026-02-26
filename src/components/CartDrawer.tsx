"use client";

import { X, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, getTotal } = useCart();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error en checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={toggleCart}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Tu Botín ({items.length})
          </h2>
          <button onClick={toggleCart} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>Tu bolsa está vacía, viajero.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-background/50 p-3 rounded-lg border border-border">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded bg-gray-800" />
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm line-clamp-2">{item.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-primary font-mono font-bold">
                      ${item.price.toLocaleString('es-AR')} x {item.quantity}
                    </span>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border bg-background/80 backdrop-blur">
            <div className="flex justify-between mb-4 text-lg font-bold text-white">
              <span>Total</span>
              <span className="font-mono text-primary">${getTotal().toLocaleString('es-AR')}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Pagar con MercadoPago"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
