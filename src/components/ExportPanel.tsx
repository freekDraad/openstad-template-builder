// ExportPanel.tsx
// Toont CSS output in een tekstveld en biedt download- en kopieerfunctie.
// Props: css: string

import React from 'react';

import { Token } from "../types/tokens.d";

interface CategorizedTokens {
  brand: Token[];
  common: Token[];
  components: Record<string, Token[]>;
}

interface ExportPanelProps {
  css: string;
  customTokens: any[];
  tokens: CategorizedTokens;
}

export function ExportPanel({ css, customTokens, tokens }: ExportPanelProps) {
  // Download als .css bestand
  function handleDownload() {
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tokens.css';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Kopieer naar klembord
  function handleCopy() {
    navigator.clipboard.writeText(css);
  }

  // Download alle tokens.json per categorie/component
  // Helper: Zet array tokens om naar geneste objectstructuur zoals Token Studio
  function tokensArrayToNestedObject(tokens: Token[]): any {
    const result: any = {};
    tokens.forEach(token => {
      // Split path op "." en bouw geneste structuur
      const path = typeof token.name === "string" ? token.name : "";
      const keys = path.split(".");
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      const tokenObj: any = {
        value: token.value,
        type: token.type
      };
      if ("description" in token && typeof token.description === "string") {
        tokenObj.description = token.description;
      }
      current[keys[keys.length - 1]] = tokenObj;
    });
    return result;
  }

  async function handleDownloadTokens() {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Voeg brand.json toe
    const brandObj = tokensArrayToNestedObject(tokens.brand);
    zip.file("brand.json", JSON.stringify(brandObj, null, 2));

    // Voeg common.json toe
    const commonObj = tokensArrayToNestedObject(tokens.common);
    zip.file("common.json", JSON.stringify(commonObj, null, 2));

    // Voeg componenten toe in map components/
    const componentsFolder = zip.folder("components");
    Object.entries(tokens.components).forEach(([key, value]) => {
      const compObj = tokensArrayToNestedObject(value);
      componentsFolder.file(`${key}.json`, JSON.stringify(compObj, null, 2));
    });

    // Voeg custom tokens toe als custom-tokens.json
    zip.file("custom-tokens.json", JSON.stringify(customTokens, null, 2));

    // Genereer en download zip
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "tokens-export.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold mb-2">CSS Export</h2>
      <textarea
        className="w-full h-96 border rounded p-4 font-mono text-sm bg-gray-50"
        readOnly
        value={css}
      />
      <div className="flex gap-2 mt-8">
        <button
          className="bg-blue-600 text-white px-12 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleDownload}
        >
          Download css
        </button>
        <button
          className="bg-blue-500 text-white px-12 py-2 rounded hover:bg-blue-600"
          onClick={handleCopy}
        >
          Kopieer css
        </button>
      </div>
<hr className="my-4" />
        <button
          className="bg-green-500 text-white px-12 py-2  rounded hover:bg-green-600"
          onClick={handleDownloadTokens}
        >
          Download tokens (.zip)
        </button>
      <div className="bg-yellow-100 text-yellow-800 p-3 mt-4 text-sm border-l-4 border-yellow-500">
        <strong>LETOP:</strong> Zorg ervoor dat je de tokens download en opslaat, deze heb je nodig om volgende keer weer door te kunnen.
      </div>

    </div>
  );
}

// Uitleg:
// - Toont CSS output in een textarea.
// - Downloadknop en kopieerknop voor export.
// - Tailwind styling voor snelle visuele opzet.
