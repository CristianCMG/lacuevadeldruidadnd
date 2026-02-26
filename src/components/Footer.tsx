import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary font-display">La Cueva del Druida</h3>
            <p className="text-gray-400 text-sm">
              Forjando aventuras impresión a impresión. Base de operaciones en Caseros, Tres de Febrero, Buenos Aires.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Mercado</h4>
            <ul className="space-y-2">
              <li><a href="#kits" className="text-gray-400 hover:text-primary transition-colors">Kits de Mazmorra</a></li>
              <li><a href="#minis" className="text-gray-400 hover:text-primary transition-colors">Miniaturas</a></li>
              <li><a href="#scenery" className="text-gray-400 hover:text-primary transition-colors">Escenografía</a></li>
              <li><a href="#custom" className="text-gray-400 hover:text-primary transition-colors">Encargos</a></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Comunidad</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Discord</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Eventos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">Bitácora</a></li>
            </ul>
          </div>

          {/* Socials */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase">Síguenos</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} La Cueva del Druida. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
