"use client";

// App.tsx
// Hoofdcomponent: combineert TokenList, TokenEditor en ExportPanel.
// Beheert UI state voor selectie en export.

import React, { useState } from 'react';
import { useTokens } from './hooks/useTokens';
import { Token } from './types/tokens.d';
import { tokenToCSS } from './utils/tokenToCSS';
import { dependencyResolver } from './utils/dependencyResolver';
import { TokenList } from './components/TokenList';
import { TokenEditor } from './components/TokenEditor';
import { ExportPanel } from './components/ExportPanel';
import { ImportPanel } from './components/ImportPanel';

export default function App() {
  const { tokens, overrideToken, resetToken } = useTokens();
  const [selectedToken, setSelectedToken] = useState({ category: '', token: null });

  // Selecteer token voor bewerken
  function handleEdit(category: string, name: string) {
    const token =
      category === 'brand' || category === 'common'
        ? tokens[category].find((t) => t.name === name) || null
        : tokens.components[category]?.find((t) => t.name === name) || null;
    setSelectedToken({ category, token });
  }

  // Sluit editor
  function handleCloseEditor() {
    setSelectedToken({ category: '', token: null });
  }


  const [tab, setTab] = useState('tokens');
  const [customTokens, setCustomTokens] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('customTokens');
      if (saved) setCustomTokens(JSON.parse(saved));
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = "LETOP: Als je deze pagina herlaadt, gaan je tokens verloren!";
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }
  }, []);

  function handleCustomEdit(name: string, value: string) {
    setCustomTokens((prev) => {
      const updated = prev.map((t: any) => (t.name === name ? { ...t, value } : t));
      localStorage.setItem('customTokens', JSON.stringify(updated));
      return updated;
    });
  }

  function handleAddCustomToken(newToken: any) {
    if (!newToken.name || !newToken.value) return;
    setCustomTokens((prev) => {
      const updated = [
        ...prev,
        { name: newToken.name, value: newToken.value },
      ];
      localStorage.setItem('customTokens', JSON.stringify(updated));
      return updated;
    });
  }

  function handleRemoveCustomToken(name: string) {
    setCustomTokens((prev) => {
      const updated = prev.filter((t: any) => t.name !== name);
      localStorage.setItem('customTokens', JSON.stringify(updated));
      return updated;
    });
  }

  // CSS string genereren met dependency resolving
  const allTokens = [
    ...tokens.brand,
    ...tokens.common,
    ...Object.values(tokens.components).flat(),
    ...customTokens,
  ];
  const [cssSelector, setCssSelector] = useState(".openstad, [data-apos-level]");
  const css = tokenToCSS(dependencyResolver(allTokens), cssSelector);

  const [activeSection, setActiveSection] = useState<string>("custom-tokens");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const ids = [
        "custom-tokens",
        "brand-tokens",
        "common-tokens",
        ...Object.keys(tokens.components).map(key => `${key}-tokens`)
      ];
      const handler = (entries: IntersectionObserverEntry[]) => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) {
          // Kies de eerste die in beeld is
          setActiveSection(visible[0].target.id);
        }
      };
      const observer = new window.IntersectionObserver(handler, {
        root: null,
        rootMargin: "0px 0px -70% 0px",
        threshold: 0.1
      });
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      });
      return () => observer.disconnect();
    }
  }, [tokens.components]);

  return (
    <div className="p-8 flex gap-8 h-screen relative justify-between">

      <div className="max-w-6xl  flex-1">
        <h1 className="text-3xl font-bold mt-8 text-gray-900">Draad Tokens Editor</h1>
        <p className="mb-8 text-gray-900">Een eenvoudige editor voor het beheren van Figma tokens.</p>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex mb-8 gap-2">
            <button
              className={`px-8 py-1 rounded ${tab === 'tokens' ? 'text-white bg-gray-900' : 'bg-gray-100 text-gray-500'}`}
              onClick={() => setTab('tokens')}
            >
              Tokens
            </button>
            <button
              className={`px-8 py-1 rounded ${tab === 'export' ? 'text-white bg-gray-900' : 'bg-gray-100 text-gray-500'}`}
              onClick={() => setTab('export')}
            >
              Export
            </button>
            <button
              className={`px-8 py-1 rounded ${tab === 'import' ? 'text-white bg-gray-900' : 'bg-gray-100 text-gray-500'}`}
              onClick={() => setTab('import')}
            >
              Import
            </button>
          </div>
          <div className="">
            {tab === 'tokens' ? (
              <TokenList
                tokens={tokens}
                customTokens={customTokens}
                onCustomEdit={handleCustomEdit}
                onCustomAdd={handleAddCustomToken}
                onCustomRemove={handleRemoveCustomToken}
                onEdit={(category, name, value) => overrideToken(category, name, value)}
                openSections={openSections}
                setOpenSections={setOpenSections}
              />
            ) : tab === 'export' ? (
              <div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    CSS selector/class voor tokens:
                  </label>
                  <input
                    type="text"
                    value={cssSelector}
                    onChange={e => setCssSelector(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded-lg w-full max-w-md"
                    placeholder="Bijv. :root, .openstad, [data-apos-level]"
                  />
                </div>
                <ExportPanel css={tokenToCSS(dependencyResolver(allTokens), cssSelector)} customTokens={customTokens} tokens={tokens} />
              </div>
            ) : (
              <ImportPanel
                onImportTokens={(newTokens) => {
                  if (newTokens) {
                    tokens.brand = newTokens.brand;
                    tokens.common = newTokens.common;
                    tokens.components = newTokens.components;
                    if (Array.isArray(newTokens.customTokens)) {
                      setCustomTokens(newTokens.customTokens);
                      localStorage.setItem('customTokens', JSON.stringify(newTokens.customTokens));
                    }
                  }
                }}
              />
            )}
          </div>
          {selectedToken.token && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <TokenEditor
                token={selectedToken.token}
                onOverride={(name, value) =>
                  overrideToken(selectedToken.category, name, value)
                }
                onReset={(name) =>
                  resetToken(selectedToken.category, name)
                }
                onClose={handleCloseEditor}
              />
            </div>
          )}
        </div>
      </div>
      <nav className="w-64 flex-shrink-0 justify-self-end">
        <h2 className="text-lg font-bold mb-4">Navigatie</h2>
        <ul className="space-y-2">
          <li>
            <a
              href="#custom-tokens"
              className={`text-blue-700 hover:underline ${activeSection === "custom-tokens" ? "font-bold" : ""}`}
              onClick={e => {
                e.preventDefault();
                const el = document.getElementById('custom-tokens');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Custom tokens
            </a>
          </li>
          <li>
            <a
              href="#brand-tokens"
              className={`text-blue-700 hover:underline ${activeSection === "brand-tokens" ? "font-bold" : ""}`}
              onClick={e => {
                e.preventDefault();
                const el = document.getElementById('brand-tokens');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Brand tokens
            </a>
          </li>
          <li>
            <a
              href="#common-tokens"
              className={`text-blue-700 hover:underline ${activeSection === "common-tokens" ? "font-bold" : ""}`}
              onClick={e => {
                e.preventDefault();
                const el = document.getElementById('common-tokens');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Common tokens
            </a>
          </li>
          {Object.keys(tokens.components).map(key => (
            <li key={key}>
              <a
                href={`#${key}-tokens`}
                className={`text-blue-700 hover:underline ${activeSection === `${key}-tokens` ? "font-bold" : ""}`}
                onClick={e => {
                  e.preventDefault();
                  const el = document.getElementById(`${key}-tokens`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} tokens
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

// Uitleg:
// - Toont tokens en export naast elkaar.
// - TokenEditor als modal bij selectie.
// - Tailwind layout voor snelle visuele opzet.
