import { getRefreshTokenCookiesSchema } from "@/schemas/getRefreshTokenCookiesSchema.js";
import { FastifyRequest } from "fastify";

export function getRefreshToken(req: FastifyRequest){

    const parsedData = getRefreshTokenCookiesSchema.safeParse(req.cookies.refresh_token)

    if(parsedData.success == false) return null

    const refresh_token = parsedData.data

    return refresh_token
}