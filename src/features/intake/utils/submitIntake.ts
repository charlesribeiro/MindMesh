import type { IntakeSubmissionResult } from '../types/intake'
import { intakeFormSchema, toSubmissionPayload } from '../schemas/intakeSchema'

export type SubmitIntakeOptions = {
  delayMs?: number
  shouldFail?: boolean
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Mock intake submission. Validates, maps to a payload, then returns a fictional id.
 */
export async function submitIntake(
  values: unknown,
  options: SubmitIntakeOptions = {},
): Promise<IntakeSubmissionResult> {
  const parsed = intakeFormSchema.safeParse(values)
  if (!parsed.success) {
    throw new Error('validation.failed')
  }

  // Keep payload mapping on the submission path for the future GraphQL boundary.
  toSubmissionPayload(parsed.data)

  await wait(options.delayMs ?? 400)

  if (options.shouldFail) {
    throw new Error('error.submission')
  }

  return {
    id: `intake-${crypto.randomUUID()}`,
  }
}

export type { IntakeSubmissionResult }
