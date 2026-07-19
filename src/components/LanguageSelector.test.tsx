import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { LanguageSelector } from './LanguageSelector'
import i18n from '../i18n'

describe('LanguageSelector', () => {
  it('switches the active language when a new option is chosen', async () => {
    const user = userEvent.setup()
    await i18n.changeLanguage('en')

    render(<LanguageSelector />)

    const select = screen.getByLabelText('Language')
    expect(select).toHaveValue('en')

    await user.selectOptions(select, 'pt-BR')

    await waitFor(() => {
      expect(i18n.language).toBe('pt-BR')
      expect(select).toHaveValue('pt-BR')
      expect(i18n.t('navigation:home')).toBe('Início')
    })
  })
})
