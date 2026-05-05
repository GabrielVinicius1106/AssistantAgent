import z from "zod";

export const refreshUserAuthCookiesSchema = z.object({
    token: z.string()
})