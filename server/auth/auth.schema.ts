import { z } from 'zod'

export const loginInputSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1),
})

export type LoginInput = z.infer<typeof loginInputSchema>
