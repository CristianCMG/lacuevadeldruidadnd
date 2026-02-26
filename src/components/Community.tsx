import { MapPin, Users } from "lucide-react";

export default function Community() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern opacity-5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-4 tracking-tight">
            Únete al Gremio Local
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Conecta con otros aventureros en Buenos Aires.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card border border-border p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-secondary/20 p-3 rounded-full text-secondary">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Punto de Encuentro</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Nuestra guarida está en <strong>Caseros, Tres de Febrero</strong>. Ahorra en el envío recogiendo tu botín directamente en nuestro taller.
            </p>
            <div className="mt-4 bg-background/50 p-4 rounded text-sm text-gray-500 font-mono border border-border">
              Calle Falsa 123 (Ejemplo), Caseros, Buenos Aires
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-lg shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-secondary/20 p-3 rounded-full text-secondary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white font-display">Eventos de la Comunidad</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Organizamos talleres de pintura mensuales y one-shots de D&D. ¡Síguenos en redes para la próxima reunión!
            </p>
            <button className="text-primary hover:text-white font-bold transition-colors">
              Ver Calendario de Eventos &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
