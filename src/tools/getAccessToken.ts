import { getAccessTokenHeaderSchema } from "@/schemas/getAccessTokenHeaderSchema.js";
import { FastifyRequest } from "fastify";

export function getAccessToken(req: FastifyRequest){

    const parsedData = getAccessTokenHeaderSchema.safeParse(req.headers)

    if(parsedData.success == false) return null

    const { access_token } = parsedData.data

    return access_token

}