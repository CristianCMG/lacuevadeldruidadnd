import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative bg-background overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60 z-10" />
        <img
          src="https://images.unsplash.com/photo-1610888301841-5665015b9553?q=80&w=2070&auto=format&fit=crop"
          alt="D&D Tabletop"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="lg:w-2/3">
          <h1 className="text-4xl md:text-6xl font-bold text-white font-display mb-6 leading-tight">
            Forja tu Leyenda <br />
            <span className="text-primary">Impresión a Impresión</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            Da vida a tus campañas con miniaturas impresas en 3D de alta calidad, mazmorras modulares y terrenos personalizados.
            Artesanía arcana desde Caseros, Argentina.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#kits"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-red-700 transition-colors md:text-lg"
            >
              Ver Kits de Inicio
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="#custom"
              className="inline-flex items-center justify-center px-8 py-3 border border-gray-500 text-base font-medium rounded-md text-gray-300 hover:text-white hover:border-white transition-colors md:text-lg bg-black/50 backdrop-blur-sm"
            >
              Encargo Personalizado
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
