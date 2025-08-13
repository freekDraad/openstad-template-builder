// TokenList.tsx
// Toont tokens per categorie (brand, common, componenten) in accordion-secties met vaste hoogte.
// Props: tokens: CategorizedTokens, onEdit: (category: string, name: string) => void

import React, { useState } from 'react';
import { Token } from '../types/tokens.d';
import { CategorizedTokens } from '../hooks/useTokens';

// Helper: groepeer tokens per type
function groupTokensByType(tokens: Token[]): Record<string, Token[]> {
  const groups: Record<string, Token[]> = {};
  tokens.forEach(token => {
    const type = token.type || 'overig';
    if (!groups[type]) groups[type] = [];
    groups[type].push(token);
  });
  return groups;
}

// Convert hsl/hex/rgb to hex for color input
function toHex(color: string): string {
  if (!color) return "#000000";
  if (color.startsWith("#")) {
    // Remove alpha if present (#rrggbbaa -> #rrggbb)
    if (color.length === 9) return color.slice(0, 7);
    if (color.length === 5) return "#000000";
    return color;
  }
  if (color.startsWith("rgb")) {
    const nums = color.match(/\d+/g);
    if (!nums) return "#000000";
    const [r, g, b] = nums.map(Number);
    return (
      "#" +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
    );
  }
  if (color.startsWith("hsl")) {
    // hsl(h, s%, l%) to hex
    const m = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
    if (!m) return "#000000";
    let [h, s, l] = m.slice(1).map(Number);
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m2 = l - c / 2;
    let r = 0,
      g = 0,
      b = 0;
    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];
    r = Math.round((r + m2) * 255);
    g = Math.round((g + m2) * 255);
    b = Math.round((b + m2) * 255);
    return (
      "#" +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")
    );
  }
  return "#000000";
}

interface TokenListProps {
  tokens: CategorizedTokens;
  customTokens: any[];
  onCustomEdit: (name: string, value: string) => void;
  onCustomAdd: (newToken: any) => void;
  onCustomRemove: (name: string) => void;
  onEdit: (category: string, name: string, value: string | number) => void;
  openSections: Record<string, boolean>;
  setOpenSections: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

function TokenTable({
  tokens,
  category,
  onEdit,
  resolvedTokens,
}: {
  tokens: Token[];
  category: string;
  onEdit: (category: string, name: string, value: string | number) => void;
  resolvedTokens: Token[];
}) {
  if (!tokens.length) return null;
  return (
    <div>
      <table className="min-w-full bg-white rounded-xl border-spacing-0">
        <thead>
          <tr>
            <th className="px-6 py-4 text-left font-semibold text-gray-700 border border-gray-200">Naam</th>
            <th className="px-6 py-4 text-left font-semibold text-gray-700 border border-gray-200">Waarde</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr
              key={token.name}
              className="hover:bg-gray-50 transition"
            >
              <td className="px-6 py-4 font-medium text-gray-900 border border-gray-200">{token.name}</td>
              <td className="px-6 py-4 border border-gray-200">
                <input
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  value={typeof token.value === 'object' ? JSON.stringify(token.value) : token.value}
                  onChange={(e) => onEdit(category, token.name, e.target.value)}
                />
              </td>
              <td className="px-0 py-4 border border-gray-200 text-center">
                {token.type === 'color' && typeof token.value === 'string' && !token.value.startsWith('{') ? (
                  <span style={{ position: 'relative', display: 'inline-block' }}>
                    <span
                      className="inline-block w-8 h-8 rounded-lg border border-gray-300 align-middle"
                      style={{ background: token.value, verticalAlign: 'middle', cursor: 'pointer' }}
                      title={token.value}
                      onClick={e => {
                        const input = (e.currentTarget.nextSibling as HTMLInputElement);
                        if (input) input.click();
                      }}
                    />
                    <input
                      type="color"
                      value={toHex(token.value)}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '32px',
                        height: '32px',
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                      onChange={(e) => onEdit(category, token.name, e.target.value)}
                    />
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccordionSection({
  title,
  description,
  children,
  open,
  onToggle,
  id,
}: {
  title: string;
  description?: string;
  children: any;
  open: boolean;
  onToggle: () => void;
  id?: string;
}) {
  return (
    <div className={`mb-4 border border-gray-200 bg-white ${id && id.includes('-type-') ? 'relative z-40' : ''}`} id={id}>
      <button
        className={`w-full flex items-center justify-between px-4 py-3 transition ${
          open ? 'bg-blue-100 border-l-4 border-blue-400' : 'bg-gray-100'
        }`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <div className="flex flex-col text-left">
          <span className="text-l font-bold text-gray-900">{title}</span>
          {description && <span className="text-gray-600 text-sm">{description}</span>}
        </div>
        <span
          className={`transform transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        >
          ▶
        </span>
      </button>
      <div
        className={`transition-all duration-300 ${
          open ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {open && <div className="p-4">{children}</div>}
      </div>
    </div>
  );
}

export function TokenList({
  tokens,
  customTokens,
  onCustomEdit,
  onCustomAdd,
  onCustomRemove,
  onEdit,
  openSections,
  setOpenSections,
}: TokenListProps) {
  const [newToken, setNewToken] = useState({
    name: '',
    value: '',
    type: '',
  });

  function toggle(key: string) {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function handleAddCustomToken(e: any) {
    e.preventDefault();
    if (!newToken.name || !newToken.value) return;
    onCustomAdd({ name: newToken.name, value: newToken.value });
    setNewToken({ name: '', value: '', type: '' });
  }

  return (
    <div>
      <AccordionSection
        title="Custom tokens"
        description="Zelf toegevoegde tokens, bijvoorbeeld voor experimenten of overrides."
        open={!!openSections['custom']}
        onToggle={() => toggle('custom')}
        id="custom-tokens"
      >
        <table className="min-w-full bg-white rounded-xl border-spacing-0 mb-2">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border border-gray-200">Naam</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-700 border border-gray-200">Waarde</th>
              <th className="px-0 py-0 text-left font-semibold text-gray-700 border border-gray-200 text-center">Actie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4 border border-gray-200">
                <input
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                  placeholder="Naam"
                  value={newToken.name}
                  onChange={(e) => setNewToken((t) => ({ ...t, name: e.target.value }))}
                />
              </td>
              <td className="px-6 py-4 border border-gray-200">
                <input
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full"
                  placeholder="Waarde"
                  value={newToken.value}
                  onChange={(e) => setNewToken((t) => ({ ...t, value: e.target.value }))}
                />
              </td>
              <td className="px-0 py-0 border border-gray-200 text-center">
                <button
                  className="bg-blue-600 text-white hover:bg-blue-700 w-8 h-8 p-0 rounded transition inline-flex items-center justify-center"
                  onClick={handleAddCustomToken}
                  title="Toevoegen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </td>
            </tr>
            {customTokens.map((token) => (
              <tr key={token.name} className="hover:bg-blue-50 transition border-b last:border-b-0" style={{ height: '56px' }}>
                <td className="px-6 py-4 border border-gray-200">{token.name}</td>
                <td className="px-6 py-4 border border-gray-200">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                    value={token.value}
                    onChange={(e) => onCustomEdit(token.name, e.target.value)}
                  />
                </td>
                <td className="px-0 py-0 border border-gray-200 text-center">
                  <button
                    className="bg-red-600 text-white hover:bg-red-700 w-8 h-8 p-0 rounded transition inline-flex items-center justify-center"
                    onClick={() => onCustomRemove(token.name)}
                    title="Verwijderen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0v12a2 2 0 002 2h4a2 2 0 002-2V7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AccordionSection>
      <AccordionSection
        title="Brand tokens"
        description="Tokens die de merkidentiteit bepalen."
        open={!!openSections['brand']}
        onToggle={() => toggle('brand')}
        id="brand-tokens"
      >
        {Object.entries(groupTokensByType(tokens.brand)).map(([type, arr]) => (
          <AccordionSection
            key={`brand-type-${type}`}
            title={type}
            open={!!openSections[`brand-type-${type}`]}
            onToggle={() => toggle(`brand-type-${type}`)}
          >
            <TokenTable tokens={arr} category="brand" onEdit={onEdit} resolvedTokens={[...tokens.brand, ...tokens.common, ...Object.values(tokens.components).flat()]} />
          </AccordionSection>
        ))}
      </AccordionSection>

      <AccordionSection
        title="Common tokens"
        description="Algemene tokens die overal gebruikt worden."
        open={!!openSections['common']}
        onToggle={() => toggle('common')}
        id="common-tokens"
      >
        {Object.entries(groupTokensByType(tokens.common)).map(([type, arr]) => (
          <AccordionSection
            key={`common-type-${type}`}
            title={type}
            open={!!openSections[`common-type-${type}`]}
            onToggle={() => toggle(`common-type-${type}`)}
          >
            <TokenTable tokens={arr} category="common" onEdit={onEdit} resolvedTokens={[...tokens.brand, ...tokens.common, ...Object.values(tokens.components).flat()]} />
          </AccordionSection>
        ))}
      </AccordionSection>

      {Object.entries(tokens.components).map(([key, value]) => (
        <AccordionSection
          key={key}
          title={`${key.charAt(0).toUpperCase() + key.slice(1)} tokens`}
          description={`Component-specifieke tokens voor ${key}.`}
          open={!!openSections[key]}
          onToggle={() => toggle(key)}
          id={`${key}-tokens`}
        >
          {Object.entries(groupTokensByType(value)).map(([type, arr]) => (
            <AccordionSection
              key={`${key}-type-${type}`}
              title={type}
              open={!!openSections[`${key}-type-${type}`]}
              onToggle={() => toggle(`${key}-type-${type}`)}
            >
              <TokenTable tokens={arr} category={key} onEdit={onEdit} resolvedTokens={[...tokens.brand, ...tokens.common, ...Object.values(tokens.components).flat()]} />
            </AccordionSection>
          ))}
        </AccordionSection>
      ))}
    </div>
  );
}

// Uitleg:
// - Alle tabellen hebben vaste hoogte en scrollen.
// - Accordion UI met Tailwind, standaard alleen brand open.
// - Consistente layout voor overzicht.
