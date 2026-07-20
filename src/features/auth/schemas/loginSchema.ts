import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { error: 'validation.emailRequired' })
    .email({ error: 'validation.emailInvalid' }),
  password: z.string().min(1, { error: 'validation.passwordRequired' }),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
