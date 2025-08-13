// tokenParser.ts
// Zet een geneste tokens JSON om naar een platte lijst van Token objects.
// Gebruik: tokenParser(jsonObject): Token[]
// Uitbreidbaar voor complexe Figma token structuren.

import { Token, TokenValue } from '../types/tokens.d';

interface RawToken {
  value: TokenValue;
  type: string;
  dependsOn?: string;
}

function flattenTokens(
  obj: Record<string, any>,
  prefix = ''
): Token[] {
  const tokens: Token[] = [];
  for (const key in obj) {
    const value = obj[key];
    const name = prefix ? `${prefix}.${key}` : key;
    if (
      typeof value === 'object' &&
      value !== null &&
      ('value' in value && 'type' in value)
    ) {
      // Alleen toevoegen als value een primitive is
      if (
        typeof value.value === 'string' ||
        typeof value.value === 'number'
      ) {
        tokens.push({
          name,
          value: value.value,
          type: value.type,
          dependsOn: value.dependsOn,
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      tokens.push(...flattenTokens(value, name));
    }
  }
  return tokens;
}

// Hoofdfunctie voor import
export function tokenParser(json: Record<string, any>): Token[] {
  return flattenTokens(json);
}

// Uitleg:
// - Geneste keys worden omgezet naar 'dot notation' namen.
// - Alleen objecten met 'value' en 'type' worden als Token toegevoegd.
// - Uitbreidbaar voor extra Figma token properties.
