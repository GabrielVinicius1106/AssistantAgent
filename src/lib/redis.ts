import { createClient } from "redis"

const redis = await createClient().on("error", (error) => {
    console.log("Redis Client Error.\n", error);
}).connect()

export { redis }