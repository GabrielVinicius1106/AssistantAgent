import { getAccessTokenHeaderSchema } from "@/schemas/getAccessTokenHeaderSchema.js";
import { logoutUserCookiesSchema } from "@/schemas/logoutUserCookiesSchema.js";
import { FastifyRequest } from "fastify";

export function getRefreshToken(req: FastifyRequest){

    const { refresh_token } = logoutUserCookiesSchema.parse(req.cookies)

    return refresh_token

}