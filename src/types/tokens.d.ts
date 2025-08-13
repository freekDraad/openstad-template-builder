// Token types voor het project

export type TokenValue = string | number;

export interface Token {
  name: string;
  value: TokenValue;
  type: string;
  dependsOn?: string;
  overridden?: boolean;
}
