"use client";

import ProductCard from "./ProductCard";

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  tag?: string;
  pictures?: { url: string }[];
  permalink?: string;
}

// Fallback products in case API fails or no token
const defaultProducts: Product[] = [
  {
    id: "1",
    title: "Kit de Mazmorra Inicial",
    price: 15000,
    image: "https://images.unsplash.com/photo-1596727147705-06a127b4b320?q=80&w=2070&auto=format&fit=crop",
    description: "Todo lo necesario para tu primera exploración. Incluye 4 muros modulares, 2 esquinas y 1 puerta.",
    tag: "Más Vendido"
  },
  {
    id: "2",
    title: "Pack Emboscada Goblin",
    price: 8500,
    image: "https://images.unsplash.com/photo-1615750785934-085e823d069e?q=80&w=1974&auto=format&fit=crop",
    description: "Una horda de 6 goblins detallados listos para la batalla. Varias poses incluidas.",
    tag: "Nuevo"
  },
  {
    id: "3",
    title: "Set de Taberna Modular",
    price: 22000,
    image: "https://images.unsplash.com/photo-1649271633543-c07e0c4d1154?q=80&w=2070&auto=format&fit=crop",
    description: "Crea el punto de encuentro perfecto. Incluye mesas, sillas, barra y barriles.",
  },
  {
    id: "4",
    title: "Miniatura Dragón Jefe",
    price: 12000,
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?q=80&w=1974&auto=format&fit=crop",
    description: "Un dragón masivo y aterrador para desafiar a tu grupo de alto nivel. Base de 100mm.",
    tag: "Legendario"
  },
];

export default function FeaturedProducts() {
  const products = defaultProducts;

  // NOTE: To enable real fetching, we would need to call an API route that calls getUserItems
  // For this MVP, we are keeping the static products but prepared the structure.
  
  return (
    <section id="kits" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-4 tracking-tight">
            Botín Legendario
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Equipa tu mesa con nuestras mejores creaciones. Desde kits esenciales hasta encuentros con jefes monstruosos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.pictures ? product.pictures[0].url : product.image}
              description={product.description || "Un ítem misterioso de la cueva."}
              tag={product.tag}
              permalink={product.permalink}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
