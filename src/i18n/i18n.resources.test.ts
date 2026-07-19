import { describe, expect, it } from 'vitest'
import i18n, { normalizeLanguage } from './index'

describe('i18n resource bundles', () => {
  it('has pt-BR bundles available and switchable', async () => {
    await i18n.changeLanguage('en')
    await i18n.changeLanguage('pt-BR')

    expect({
      hasPtBR: i18n.hasResourceBundle('pt-BR', 'navigation'),
      store: Object.keys(i18n.services.resourceStore.data),
      language: i18n.language,
      resolvedLanguage: i18n.resolvedLanguage,
      home: i18n.t('navigation:home'),
      homeExplicit: i18n.getResource('pt-BR', 'navigation', 'home'),
      normalized: normalizeLanguage(i18n.resolvedLanguage ?? i18n.language),
    }).toEqual({
      hasPtBR: true,
      store: ['en', 'pt-BR'],
      language: 'pt-BR',
      resolvedLanguage: 'pt-BR',
      home: 'Início',
      homeExplicit: 'Início',
      normalized: 'pt-BR',
    })
  })
})
