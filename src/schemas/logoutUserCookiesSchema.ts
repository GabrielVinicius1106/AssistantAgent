import z from "zod"; 

export const logoutUserCookiesSchema = z.object({
    refresh_token: z.string()
})