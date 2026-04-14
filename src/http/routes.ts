import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { createUserController } from "./controllers/createUserController.js";
import { loginUserController } from "./controllers/loginUserController.js";
import { refreshUserAuthController } from "./controllers/refreshUserAuthController.js";
import { logoutUserController } from "./controllers/logoutUserController.js";

import jwt from "jsonwebtoken"
import { getAccessTokenHeaderSchema } from "@/schemas/getAccessTokenHeaderSchema.js";
import { env } from "@/env/index.js";
import { getAccessToken } from "@/lib/getAccessToken.js";
import { redis } from "@/lib/redis.js";

export async function publicRoutes(app: FastifyInstance){

    app.post("/api/v1/auth/register", createUserController) // Public Route
    app.post("/api/v1/auth/login", loginUserController) // // Public Route

    app.post("/api/v1/auth/refresh", refreshUserAuthController) // Public Route

}

export async function privateRoutes(app: FastifyInstance){
    
    // Auth Validation
    app.addHook("preHandler", async (req: FastifyRequest, res: FastifyReply) => {

        const access_token = getAccessToken(req)

        if(!access_token) return res.status(401).send({ message: "Access Token is Required." })

        // Implement Search on Black List
        if(await redis.get(access_token)) return res.status(401).send({ message: "Unauthorized." })

        try {

            // Verify Token 
            jwt.verify(access_token, env.JWT_SECRET)

        } catch(error) {
            return res.status(401).send({
                message: "Unauthorized."
            })
        }

    })

    app.post("/api/v1/auth/logout", logoutUserController) // Public Route

    
}