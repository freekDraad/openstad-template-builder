// TokenEditor.tsx
// Inline editor voor één token, met override en reset functionaliteit.
// Props: token: Token, onOverride: (name, value) => void, onReset: (name) => void, onClose: () => void

import React, { useState } from 'react';
import { Token } from '../types/tokens.d';

interface TokenEditorProps {
  token: Token;
  onOverride: (name: string, value: string | number) => void;
  onReset: (name: string) => void;
  onClose: () => void;
}

export function TokenEditor({
  token,
  onOverride,
  onReset,
  onClose,
}: TokenEditorProps) {
  const [value, setValue] = useState(token.value);

  return (
    <div className="bg-white p-4 rounded shadow border max-w-sm">
      <h2 className="text-lg font-bold mb-2">Bewerk token</h2>
      <div className="mb-2">
        <label className="block text-sm font-medium">Naam</label>
        <div className="bg-gray-100 px-2 py-1 rounded">{token.name}</div>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Waarde</label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Type</label>
        <div className="bg-gray-100 px-2 py-1 rounded">{token.type}</div>
      </div>
      <div className="mb-2">
        <label className="block text-sm font-medium">Afhankelijkheid</label>
        <div className="bg-gray-100 px-2 py-1 rounded">
          {token.dependsOn || '-'}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={() => onOverride(token.name, value)}
        >
          Opslaan
        </button>
        {token.overridden && (
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            onClick={() => onReset(token.name)}
          >
            Reset
          </button>
        )}
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          onClick={onClose}
        >
          Sluiten
        </button>
      </div>
    </div>
  );
}

// Uitleg:
// - Toont token details en laat override/reset toe.
// - Input is alleen actief bij override.
// - Tailwind styling voor snelle visuele opzet.
