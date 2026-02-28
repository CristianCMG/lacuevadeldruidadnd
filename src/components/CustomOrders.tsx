"use client";

import { Hammer, Upload, Sparkles, AlertCircle, CheckCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const SecureViewer = dynamic(() => import("./SecureViewer"), { ssr: false });

export default function CustomOrders() {
  const [code, setCode] = useState("");
  const [isValidated, setIsValidated] = useState(false);
  const [credits, setCredits] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleValidate = async () => {
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/orders/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      
      if (data.valid) {
        setIsValidated(true);
        setCredits(data.credits);
      } else {
        setError(data.message || "Código inválido");
      }
    } catch {
      setError("Error al validar código");
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");
    
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, prompt }),
      });
      const data = await res.json();

      if (data.success) {
        setModelUrl(data.modelUrl);
        setGenerationId(data.generationId);
        setCredits(data.credits);
      } else {
        setError(data.error || "Error en la generación");
      }
    } catch {
      setError("Fallo crítico en la forja");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!generationId) return;
    try {
      const res = await fetch("/api/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, generationId }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("¡Modelo aprobado! Nuestros artesanos comenzarán la impresión.");
        setModelUrl(null); // Clear viewer
        setPrompt("");
      }
    } catch {
      setError("Error al aprobar");
    }
  };

  const handleRefund = async () => {
    if (!confirm("¿Estás seguro? Esto anulará tus créditos restantes y solicitará el reembolso.")) return;
    try {
      const res = await fetch("/api/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, reason: "User rejected generation" }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Reembolso solicitado correctamente.");
        setIsValidated(false);
        setCode("");
      } else {
        setError(data.error);
      }
    } catch {
      setError("Error al solicitar reembolso");
    }
  };

  return (
    <section id="custom" className="py-24 bg-card border-y border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          
          {/* Left Column: Info & Code Input */}
          <div className="w-full md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white font-display mb-4 tracking-tight">
              La Forja Arcana
            </h2>
            <p className="text-gray-400 text-lg">
              Utiliza magia de invocación (IA) para crear miniaturas únicas. Ingresa tu código de &quot;Pack de Forja&quot; para comenzar.
            </p>

            {!isValidated ? (
              <div className="bg-background/50 p-6 rounded-lg border border-border space-y-4">
                <label className="block text-sm font-medium text-gray-300">Código de Acceso</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="FORJA-XXXX"
                    className="flex-1 bg-black/50 border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-primary"
                  />
                  <button 
                    onClick={handleValidate}
                    className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-md font-bold transition-colors"
                  >
                    Entrar
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</p>}
              </div>
            ) : (
              <div className="bg-background/50 p-6 rounded-lg border border-primary/50 space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <span className="text-green-400 font-mono text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Código Activo
                  </span>
                  <span className="text-white font-bold bg-primary/20 px-3 py-1 rounded-full text-xs">
                    {credits} Intentos Restantes
                  </span>
                </div>

                {!modelUrl ? (
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">Describe tu Miniatura</label>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Un guerrero orco con armadura de placas sosteniendo un hacha gigante..."
                      className="w-full h-32 bg-black/50 border border-border rounded-md px-4 py-2 text-white focus:outline-none focus:border-primary resize-none"
                    />
                    <button 
                      onClick={handleGenerate}
                      disabled={loading || credits <= 0}
                      className="w-full bg-secondary hover:bg-yellow-600 text-black font-bold py-3 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>Invocando... <Sparkles className="h-5 w-5 animate-spin" /></>
                      ) : (
                        <>Forjar Miniatura <Hammer className="h-5 w-5" /></>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      Nota: El proceso puede tardar unos minutos. No cierres la ventana.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-white font-bold">Resultado de la Forja</h3>
                    <SecureViewer modelUrl={modelUrl} />
                    
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleApprove}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md transition-colors"
                      >
                        Aprobar e Imprimir
                      </button>
                      <button 
                        onClick={() => setModelUrl(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" /> Reintentar
                      </button>
                    </div>
                    <button 
                      onClick={handleRefund}
                      className="w-full text-red-500 hover:text-red-400 text-sm underline mt-2"
                    >
                      No estoy satisfecho, solicitar reembolso (24h)
                    </button>
                  </div>
                )}
                
                {successMsg && (
                  <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-md text-sm flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> {successMsg}
                  </div>
                )}
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </div>
            )}
            
            <ul className="space-y-4 mt-8 opacity-70">
              <li className="flex items-start gap-4">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">¿Prefieres tus propios archivos?</h4>
                  <p className="text-gray-400 text-sm">También aceptamos STLs de HeroForge o Thingiverse.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Right Column: Visual */}
          <div className="w-full md:w-1/2 relative hidden md:block">
            <div className="absolute inset-0 bg-secondary blur-[100px] opacity-10 rounded-full" />
            <Image 
              src="https://images.unsplash.com/photo-1626071485664-9d1073832c3f?q=80&w=2070&auto=format&fit=crop" 
              alt="3D Printing" 
              width={800}
              height={600}
              className="rounded-lg border border-border shadow-2xl relative z-10 transform -rotate-2 hover:rotate-0 transition-transform duration-500 grayscale hover:grayscale-0"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
}
