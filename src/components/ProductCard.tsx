"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/store/cart";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  tag?: string;
  permalink?: string;
}

export default function ProductCard({ id, title, price, image, description, tag, permalink }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({ id, title, price, image });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02] hover:border-primary group">
      <div className="relative aspect-video overflow-hidden">
        {tag && (
          <span className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-sm z-10 uppercase tracking-wide">
            {tag}
          </span>
        )}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white font-display mb-2 truncate" title={title}>{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">{description}</p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Valor</span>
            <span className="text-lg font-bold text-primary font-mono">
              ${price.toLocaleString('es-AR')}
            </span>
          </div>
          
          <div className="flex gap-2">
            {permalink && (
              <a 
                href={permalink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-secondary hover:bg-yellow-600 text-black p-2 rounded-md transition-colors text-xs font-bold flex items-center"
              >
                MeLi
              </a>
            )}
            <button 
              onClick={handleAddToCart}
              className="bg-primary hover:bg-red-700 text-white p-2 rounded-md transition-colors flex items-center gap-2 px-4 text-sm font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              Añadir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
