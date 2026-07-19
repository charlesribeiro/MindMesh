import type { SupportedLanguage } from '../../../i18n'

export function formatSessionPrice(
  amount: number,
  language: SupportedLanguage | string,
): string {
  const locale = language === 'pt-BR' || language.startsWith('pt') ? 'pt-BR' : 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}
