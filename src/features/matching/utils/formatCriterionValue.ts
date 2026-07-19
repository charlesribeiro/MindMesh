import type { TFunction } from 'i18next'
import { formatSessionPrice } from '../../intake/utils/formatIntake'
import type { MatchCriterion } from '../domain/matchingTypes'

const modalityKeys: Record<string, string> = {
  online: 'options.modality.online',
  'in-person': 'options.modality.inPerson',
  'no-preference': 'options.modality.noPreference',
}

const periodKeys: Record<string, string> = {
  morning: 'options.period.morning',
  afternoon: 'options.period.afternoon',
  evening: 'options.period.evening',
}

const languageKeys: Record<string, string> = {
  en: 'options.language.en',
  'pt-BR': 'options.language.ptBR',
  es: 'options.language.es',
  'no-preference': 'options.language.noPreference',
}

const topicKeys: Record<string, string> = {
  anxiety: 'options.supportTopic.anxiety',
  relationships: 'options.supportTopic.relationships',
  work: 'options.supportTopic.work',
  grief: 'options.supportTopic.grief',
  'self-knowledge': 'options.supportTopic.selfKnowledge',
  other: 'options.supportTopic.other',
}

const genderKeys: Record<string, string> = {
  female: 'options.gender.female',
  male: 'options.gender.male',
  'non-binary': 'options.gender.nonBinary',
  'not-specified': 'options.gender.notSpecified',
  'no-preference': 'options.gender.noPreference',
}

function labelList(
  values: readonly string[],
  keyMap: Record<string, string>,
  t: TFunction<'matching'>,
): string {
  return values.map((value) => t(keyMap[value] ?? value)).join(', ')
}

export function formatCriterionValue(
  criterion: MatchCriterion,
  t: TFunction<'matching'>,
  language: string,
): string {
  const { id, intakeValue, professionalValue } = criterion

  switch (id) {
    case 'modality': {
      const intakeLabel =
        typeof intakeValue === 'string'
          ? t(modalityKeys[intakeValue] ?? intakeValue)
          : String(intakeValue)
      const proLabel = Array.isArray(professionalValue)
        ? labelList(professionalValue, modalityKeys, t)
        : String(professionalValue)
      return `${intakeLabel} → ${proLabel}`
    }
    case 'period': {
      const intakeLabel = Array.isArray(intakeValue)
        ? labelList(intakeValue, periodKeys, t)
        : String(intakeValue)
      const proLabel = Array.isArray(professionalValue)
        ? labelList(professionalValue, periodKeys, t)
        : String(professionalValue)
      return `${intakeLabel} → ${proLabel}`
    }
    case 'price': {
      const budget =
        typeof intakeValue === 'number'
          ? formatSessionPrice(intakeValue, language)
          : String(intakeValue)
      const price =
        typeof professionalValue === 'number'
          ? formatSessionPrice(professionalValue, language)
          : String(professionalValue)
      return `${budget} → ${price}`
    }
    case 'language': {
      const intakeLabel =
        typeof intakeValue === 'string'
          ? t(languageKeys[intakeValue] ?? intakeValue)
          : String(intakeValue)
      const proLabel = Array.isArray(professionalValue)
        ? labelList(professionalValue, languageKeys, t)
        : String(professionalValue)
      return `${intakeLabel} → ${proLabel}`
    }
    case 'topic': {
      const intakeLabel =
        typeof intakeValue === 'string'
          ? t(topicKeys[intakeValue] ?? intakeValue)
          : String(intakeValue)
      const proLabel = Array.isArray(professionalValue)
        ? labelList(professionalValue, topicKeys, t)
        : String(professionalValue)
      return `${intakeLabel} → ${proLabel}`
    }
    case 'gender': {
      const intakeLabel =
        typeof intakeValue === 'string'
          ? t(genderKeys[intakeValue] ?? intakeValue)
          : String(intakeValue)
      const proLabel =
        typeof professionalValue === 'string'
          ? t(genderKeys[professionalValue] ?? professionalValue)
          : String(professionalValue)
      return `${intakeLabel} → ${proLabel}`
    }
    default:
      return ''
  }
}

export function formatModalityList(
  values: readonly string[],
  t: TFunction<'matching'>,
): string {
  return labelList(values, modalityKeys, t)
}

export function formatPeriodList(
  values: readonly string[],
  t: TFunction<'matching'>,
): string {
  return labelList(values, periodKeys, t)
}

export function formatLanguageList(
  values: readonly string[],
  t: TFunction<'matching'>,
): string {
  return labelList(values, languageKeys, t)
}

export function formatTopicList(
  values: readonly string[],
  t: TFunction<'matching'>,
): string {
  return labelList(values, topicKeys, t)
}
