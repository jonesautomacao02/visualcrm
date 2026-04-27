const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Formata um número como moeda Real Brasileiro (R$).
 * Ex: 1500 → "R$ 1.500,00"
 */
export function formatCurrency(value: number): string {
  return BRL.format(value);
}

/**
 * Formata valor compacto em BRL para exibição em gráficos/cards.
 * Ex: 1500000 → "R$ 1,5M" | 1500 → "R$ 1,5k"
 */
export function formatCurrencyCompact(value: number): string {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}k`;
  return BRL.format(value);
}
