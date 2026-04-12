import z from "zod";

export const refreshUserAuthBodySchema = z.object({
    token: z.string()
})