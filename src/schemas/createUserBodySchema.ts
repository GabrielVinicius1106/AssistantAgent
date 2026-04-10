import z from "zod";

export const createUserBodySchema = z.object({
    email: z.email(),
    name: z.string(),
    password: z.string()
})