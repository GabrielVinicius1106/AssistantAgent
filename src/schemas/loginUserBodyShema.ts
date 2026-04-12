import z from "zod";

export const loginUserBodySchema = z.object({
    email: z.email(),
    password: z.string()
})