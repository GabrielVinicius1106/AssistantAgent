import z from "zod"; 

export const getRefreshTokenCookiesSchema = z.string().nonempty()