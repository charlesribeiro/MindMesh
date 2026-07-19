import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enNavigation from './locales/en/navigation.json'
import enPages from './locales/en/pages.json'
import enIntake from './locales/en/intake.json'

import ptBRCommon from './locales/pt-BR/common.json'
import ptBRNavigation from './locales/pt-BR/navigation.json'
import ptBRPages from './locales/pt-BR/pages.json'
import ptBRIntake from './locales/pt-BR/intake.json'

export const defaultNS = 'common'
export const supportedLanguages = ['en', 'pt-BR'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

export function normalizeLanguage(
  language: string | undefined,
): SupportedLanguage {
  if (!language) {
    return 'en'
  }

  const normalized = language.toLowerCase()
  if (normalized === 'pt-br' || normalized === 'pt' || normalized.startsWith('pt-')) {
    return 'pt-BR'
  }

  if (normalized === 'en' || normalized.startsWith('en-')) {
    return 'en'
  }

  return 'en'
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        navigation: enNavigation,
        pages: enPages,
        intake: enIntake,
      },
      'pt-BR': {
        common: ptBRCommon,
        navigation: ptBRNavigation,
        pages: ptBRPages,
        intake: ptBRIntake,
      },
    },
    fallbackLng: 'en',
    supportedLngs: [...supportedLanguages, 'pt'],
    nonExplicitSupportedLngs: true,
    defaultNS,
    ns: ['common', 'navigation', 'pages', 'intake'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mindmesh-language',
      convertDetectedLanguage: (language) => normalizeLanguage(language),
    },
  })

export default i18n
