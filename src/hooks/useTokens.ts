// useTokens.ts
// Hook voor token state management, parsing, dependency resolving en overrides.
// Categoriseert tokens per bron: brand, common, componenten.

import React, { useState } from 'react';
import { Token } from '../types/tokens.d';
import { tokenParser } from '../utils/tokenParser';

export interface CategorizedTokens {
  brand: Token[];
  common: Token[];
  components: Record<string, Token[]>;
  radiobutton: Token[];
}

export function useTokens() {
  const [tokens, setTokens] = useState<CategorizedTokens>({
    brand: [],
    common: [],
    components: {},
    radiobutton: [],
  });

  React.useEffect(() => {
    async function fetchTokens() {
      // Voeg hier alle component-bestanden toe uit public/components
      const componentFiles = [
        'accordion.json',
        'alert.json',
        'avatar.json',
        'backdrop.json',
        'blockquote.json',
        'breadcrumb.json',
        'button-group.json',
        'button.json',
        'checkbox-group.json',
        'checkbox.json',
        'counter-badge.json',
        'data-list.json',
        'drawer.json',
        'form-field-checkbox-option.json',
        'form-field-description.json',
        'form-field-error-message.json',
        'form-field-label.json',
        'form-field-option-label.json',
        'form-field-radio-option.json',
        'form-field.json',
        'heading.json',
        'icon-only-button.json',
        'link.json',
        'modal-dialog.json',
        'ordered-list.json',
        'pagination.json',
        'paragraph.json',
        'radio-group.json',
        'radio.json',
        'select.json',
        'separator.json',
        'side-nav.json',
        'skip-link.json',
        'status-badge.json',
        'table.json',
        'task-list.json',
        'text-input.json',
        'textarea.json',
        'toolbar-button.json',
        'unordered-list.json',
        // Voeg hier extra component-bestanden toe indien nodig
      ];

      const [brandJson, commonJson, ...componentJsons] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || "/openstad-template-builder"}/brand.json`).then((res) => res.ok ? res.json() : {}),
        fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || "/openstad-template-builder"}/common.json`).then((res) => res.ok ? res.json() : {}),
        ...componentFiles.map((file) =>
          fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || "/openstad-template-builder"}/components/${file}`)
            .then((res) => res.ok ? res.json() : {})
            .catch(() => ({}))
        ),
      ]);

      // Radio-button.json apart fetchen
      const radioButtonJson = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || "/openstad-template-builder"}/radio-button.json`)
        .then((res) => res.ok ? res.json() : {})
        .catch(() => ({}));

      const brand = tokenParser(brandJson);
      const common = tokenParser(commonJson);
      const components: Record<string, Token[]> = {};
      componentFiles.forEach((file, i) => {
        const key = file.replace('.json', '');
        components[key] = tokenParser(componentJsons[i]);
      });
      components['radio-button'] = tokenParser(radioButtonJson);

      setTokens({ brand, common, components, radiobutton: tokenParser(radioButtonJson) });
    }

    fetchTokens();
  }, []);

  // Token updaten (override)
  function overrideToken(category: string, name: string, value: string | number) {
    setTokens((prev) => {
      if (category === 'brand' || category === 'common') {
        return {
          ...prev,
          [category]: prev[category].map((t) =>
            t.name === name ? { ...t, value, overridden: true } : t
          ),
        };
      }
      return {
        ...prev,
        components: {
          ...prev.components,
          [category]: prev.components[category].map((t) =>
            t.name === name ? { ...t, value, overridden: true } : t
          ),
        },
      };
    });
  }

  function resetToken(category: string, name: string) {
    setTokens((prev) => {
      if (category === 'brand' || category === 'common') {
        return {
          ...prev,
          [category]: prev[category].map((t) =>
            t.name === name ? { ...t, overridden: false } : t
          ),
        };
      }
      return {
        ...prev,
        components: {
          ...prev.components,
          [category]: prev.components[category].map((t) =>
            t.name === name ? { ...t, overridden: false } : t
          ),
        },
      };
    });
  }

  return {
    tokens,
    overrideToken,
    resetToken,
  };
}

// Uitleg:
// - Laadt alle component-bestanden uit public/components (pas array aan indien nodig).
// - Categoriseert tokens per bron.
// - overrideToken/resetToken werken per categorie.
