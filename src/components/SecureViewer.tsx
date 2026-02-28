"use client";

import { useEffect, useRef } from "react";

interface SecureViewerProps {
  modelUrl: string;
}

export default function SecureViewer({ modelUrl }: SecureViewerProps) {
  const viewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Import model-viewer dynamically (web component)
    import("@google/model-viewer");
  }, []);

  return (
    <div 
      className="relative w-full h-[400px] bg-black/20 rounded-lg overflow-hidden border border-primary/30"
      onContextMenu={(e) => e.preventDefault()} // Disable right-click
    >
      {/* @ts-expect-error - model-viewer is a web component */}
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt="Tu miniatura generada"
        auto-rotate
        camera-controls
        shadow-intensity="1"
        style={{ width: "100%", height: "100%" }}
        disable-zoom // Optional: Limit interaction
      />
      
      {/* Overlay to prevent direct interaction/download if needed, 
          but allow camera controls. Transparent div on top captures right clicks. */}
      <div 
        className="absolute inset-0 z-10" 
        onContextMenu={(e) => e.preventDefault()}
        style={{ pointerEvents: 'none' }} // Let clicks pass through for rotation
      />
      
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 select-none">
        Vista Previa - No Descargable
      </div>
    </div>
  );
}
