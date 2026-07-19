import type {
  IntakeFormValues,
  IntakeSubmissionResult,
} from '../domain/intake'
import { intakeFormSchema, type IntakeFormParsed } from './schema'

export type SubmitIntakeOptions = {
  /** Simulated network delay in milliseconds. */
  delayMs?: number
  /** When true, the mock submit fails after the delay. */
  shouldFail?: boolean
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Mock intake submission. Validates with Zod, then resolves a fictional id.
 * Replace with a GraphQL mutation later.
 */
export async function submitIntake(
  values: IntakeFormValues | IntakeFormParsed,
  options: SubmitIntakeOptions = {},
): Promise<IntakeSubmissionResult> {
  const parsed = intakeFormSchema.safeParse(values)
  if (!parsed.success) {
    throw new Error('Intake data failed validation.')
  }

  const delayMs = options.delayMs ?? 400
  await wait(delayMs)

  if (options.shouldFail) {
    throw new Error('status.failed')
  }

  return {
    id: `intake-${crypto.randomUUID()}`,
  }
}
