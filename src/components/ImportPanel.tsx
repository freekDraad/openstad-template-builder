import React from "react";

// Vereist: JSZip geïnstalleerd
import { Token } from "../types/tokens.d";

interface CategorizedTokens {
  brand: Token[];
  common: Token[];
  components: Record<string, Token[]>;
}

interface ImportPanelProps {
  onImportTokens: (tokens: CategorizedTokens & { customTokens?: any[] }) => void;
}

export function ImportPanel({ onImportTokens }: ImportPanelProps) {
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFeedback(null);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);

      // Helper: parse geneste object naar tokens array
      function nestedObjectToTokens(obj: any): Token[] {
        const tokens: Token[] = [];
        function traverse(current: any, path: string[] = []) {
          if (
            typeof current === "object" &&
            current !== null &&
            "value" in current &&
            "type" in current
          ) {
            tokens.push({
              name: path.join("."),
              value: String((current as any).value),
              type: String((current as any).type),
              ...(typeof (current as any).description === "string" ? { description: (current as any).description } : {}),
            });
          }
          if (typeof current === "object" && current !== null) {
            Object.entries(current).forEach(([key, value]) => {
              if (typeof value === "object" && value !== null) {
                traverse(value, [...path, key]);
              }
            });
          }
        }
        traverse(obj, []);
        return tokens;
      }

      // Parse brand.json
      let brand: Token[] = [];
      if (zip.file("brand.json")) {
        const brandJson = await zip.file("brand.json").async("string");
        const brandObj = JSON.parse(brandJson);
        const rootKey = Object.keys(brandObj)[0];
        brand = nestedObjectToTokens(brandObj[rootKey]);
      }

      // Parse common.json
      let common: Token[] = [];
      if (zip.file("common.json")) {
        const commonJson = await zip.file("common.json").async("string");
        const commonObj = JSON.parse(commonJson);
        const rootKey = Object.keys(commonObj)[0];
        common = nestedObjectToTokens(commonObj[rootKey]);
      }

      // Parse components/*.json
      const components: Record<string, Token[]> = {};
      const componentFiles = Object.keys(zip.files).filter((f) =>
        f.startsWith("components/") && f.endsWith(".json")
      );
      for (const file of componentFiles) {
        const compJson = await zip.file(file).async("string");
        const compObj = JSON.parse(compJson);
        const rootKey = Object.keys(compObj)[0];
        components[file.replace("components/", "").replace(".json", "")] = nestedObjectToTokens(compObj[rootKey]);
      }

      // Lees custom-tokens.json
      let customTokens: any[] = [];
      if (zip.file("custom-tokens.json")) {
        const customJson = await zip.file("custom-tokens.json").async("string");
        customTokens = JSON.parse(customJson);
      }

      // Geef tokens door aan app
      onImportTokens({ brand, common, components, customTokens });
      setFeedback({ type: "success", message: "Tokens succesvol geïmporteerd!" });
    } catch (err) {
      setFeedback({ type: "error", message: "Fout bij importeren van zip-bestand." });
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold mb-2">Importeer tokens zip</h2>
      <input
        id="zip-upload"
        type="file"
        accept=".zip"
        onChange={handleFileChange}
        className="hidden"
      />
      <label htmlFor="zip-upload">
        <button
          type="button"
          className="bg-blue-600 text-white px-12 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition mb-4"
          onClick={() => document.getElementById('zip-upload')?.click()}
        >
          Bestand kiezen (.zip)
        </button>
      </label>
      <div className="bg-blue-100 text-blue-800 p-3 mt-4 text-sm border-l-4 border-blue-500">
        Importeer een zip-bestand met dezelfde structuur als de export.
        Zorg ervoor dat je de tokens download en opslaat, deze heb je nodig om volgende keer weer door te kunnen.
      <br />
        Dit kan ook een export zijn uit figma token studio, let er dan op dat je  'multiple files' kiest bij het exporteren.
      </div>
      {feedback && (
        <div
          className={`mt-2 text-sm px-3 py-2 rounded ${feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
