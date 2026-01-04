"use client";

import { useEffect } from "react";

interface JsonLdProps {
  schema: Record<string, unknown>;
}

export function JsonLd({ schema }: JsonLdProps) {
  useEffect(() => {
    // Create script element for JSON-LD
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    script.id = `json-ld-${schema["@type"] as string}`;
    
    // Add to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const existingScript = document.getElementById(`json-ld-${schema["@type"] as string}`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [schema]);

  return null;
}
