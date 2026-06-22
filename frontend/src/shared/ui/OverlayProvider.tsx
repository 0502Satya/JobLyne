"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";

type OverlayContextType = {
  mountOverlay: (id: string, element: React.ReactNode) => void;
  unmountOverlay: (id: string) => void;
};

const OverlayContext = createContext<OverlayContextType | null>(null);

export function useOverlay() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
}

export default function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlays, setOverlays] = useState<Record<string, React.ReactNode>>({});
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let node = document.getElementById("overlay-portal-root");
    if (!node) {
      node = document.createElement("div");
      node.id = "overlay-portal-root";
      document.body.appendChild(node);
    }
    setPortalNode(node);
  }, []);

  const mountOverlay = (id: string, element: React.ReactNode) => {
    setOverlays((prev) => ({ ...prev, [id]: element }));
  };

  const unmountOverlay = (id: string) => {
    setOverlays((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <OverlayContext.Provider value={{ mountOverlay, unmountOverlay }}>
      {children}
      {portalNode &&
        createPortal(
          <div className="relative" style={{ zIndex: "var(--z-modal)" }}>
            {Object.entries(overlays).map(([id, element]) => (
              <div key={id} id={`overlay-${id}`}>
                {element}
              </div>
            ))}
          </div>,
          portalNode
        )}
    </OverlayContext.Provider>
  );
}
