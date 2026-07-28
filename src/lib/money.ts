/**
 * Single source of truth for money formatting. The backend has always run
 * in PHP (every generated email says "PHP 33,956"); the UI used to hardcode
 * `$` everywhere it rendered an amount. Route every money render through
 * this helper instead of a literal `$`/`.toFixed(2)`.
 */
const PHP_FORMATTER = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(amount: number | null | undefined): string {
  return PHP_FORMATTER.format(Number(amount) || 0);
}
