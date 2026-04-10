import { FastifyInstance } from "fastify";
import { createUserController } from "./controllers/createUserController.js";

export async function appRoutes(app: FastifyInstance){

    app.post("/api/users", createUserController)

}