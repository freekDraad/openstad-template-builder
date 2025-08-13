// dependencyResolver.ts
// Resolves afhankelijkheden tussen tokens en update child tokens bij wijziging van parent.
// Gebruik: dependencyResolver(tokens): Token[]
// Uitbreidbaar voor complexe dependency chains.

import { Token, TokenValue } from '../types/tokens.d';

// Resolves alle afhankelijkheden in een flat token list
export function dependencyResolver(tokens: Token[]): Token[] {
  const tokenMap = new Map(tokens.map((t) => [t.name, t]));

  function resolveValue(token: Token, seen: Set<string> = new Set()): TokenValue {
    if (
      typeof token.value === 'string' &&
      token.value.startsWith('{') &&
      token.value.endsWith('}')
    ) {
      const depName = token.value.slice(1, -1);
      if (seen.has(depName)) return token.value; // prevent infinite loop
      const depToken = tokenMap.get(depName);
      if (depToken) {
        return resolveValue(depToken, new Set([...seen, depName]));
      }
    }
    return token.value;
  }

  const resolvedTokens: Token[] = tokens.map((token) => ({
    ...token,
    value: resolveValue(token),
  }));

  return resolvedTokens;
}

// Uitleg:
// - Zoekt tokens met een waarde als '{token.name}' en vervangt deze door de waarde van de parent.
// - Kan uitgebreid worden voor recursieve dependency chains en overrides.
