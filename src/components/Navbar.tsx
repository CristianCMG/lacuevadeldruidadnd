"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu } from "lucide-react";
import { useCart } from "@/store/cart";
import CartDrawer from "./CartDrawer";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { items, toggleCart } = useCart();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-primary font-display tracking-wider">
                La Cueva del Druida
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="#kits" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Kits
                </Link>
                <Link href="#minis" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Miniaturas
                </Link>
                <Link href="#scenery" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Escenografía
                </Link>
                <Link href="#custom" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Encargos
                </Link>
              </div>
            </div>

            {/* Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>
              <button 
                onClick={toggleCart}
                className="text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors relative"
                aria-label="Carrito de compras"
              >
                <ShoppingCart className="h-5 w-5" />
                {mounted && items.length > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                    {items.length}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                className="text-gray-300 hover:text-white p-2"
                aria-label="Menú principal"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
