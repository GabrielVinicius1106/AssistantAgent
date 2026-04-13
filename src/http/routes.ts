import { FastifyInstance } from "fastify";

import { createUserController } from "./controllers/createUserController.js";
import { loginUserController } from "./controllers/loginUserController.js";
import { refreshUserAuthController } from "./controllers/refreshUserAuthController.js";
import { logoutUserController } from "./controllers/logoutUserController.js";

export async function appRoutes(app: FastifyInstance){

    app.post("/api/v1/auth/register", createUserController)
    app.post("/api/v1/auth/login", loginUserController)
    app.post("/api/v1/auth/refresh", refreshUserAuthController)
    app.post("/api/v1/auth/logout", logoutUserController)

}