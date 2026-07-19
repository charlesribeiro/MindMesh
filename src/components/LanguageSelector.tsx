import { useTranslation } from 'react-i18next'
import { normalizeLanguage, type SupportedLanguage } from '../i18n'

const languageOptions: Array<{ value: SupportedLanguage; labelKey: 'en' | 'ptBR' }> =
  [
    { value: 'en', labelKey: 'en' },
    { value: 'pt-BR', labelKey: 'ptBR' },
  ]

export function LanguageSelector() {
  const { t, i18n } = useTranslation('common')
  const currentLanguage = normalizeLanguage(
    i18n.resolvedLanguage ?? i18n.language,
  )

  return (
    <div className="language-selector">
      <label htmlFor="language-selector" className="visually-hidden">
        {t('accessibility.languageSelector')}
      </label>
      <select
        id="language-selector"
        className="language-selector__control"
        value={currentLanguage}
        onChange={(event) => {
          const nextLanguage = normalizeLanguage(event.target.value)
          void i18n.changeLanguage(nextLanguage)
        }}
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {t(`language.${option.labelKey}`)}
          </option>
        ))}
      </select>
    </div>
  )
}
