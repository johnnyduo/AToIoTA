// src/types/explorer.d.ts
export interface TokenTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  tokenSymbol?: string;
  tokenName?: string;
}

export interface WhaleTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  timestamp: number;
  age: string;
  tokenSymbol: string;
  tokenName: string;
  type: 'buy' | 'sell' | 'transfer';
}