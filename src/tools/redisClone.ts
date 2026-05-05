// A Redis Simplified Implementation

import { RedisInterface, RedisObject, RedisTypes } from "@/tools/interfaces/RedisInterface.js"
import { date } from "zod"

type miliseconds = number

// Simplified Version of REDIS

class Redis implements RedisInterface {

    private map: Map<RedisTypes, RedisObject>

    constructor(){ 
        this.map = new Map()
    }

    // Set a NEW VALUE to MEMORY
    SET(key: RedisTypes, value: RedisTypes, expires_in: miliseconds): void {
        
        const expireTime = new Date().getTime() + expires_in

        const created_at = new Date()
        const expires_at = new Date(expireTime)

        this.map.set(key, { 
            value, 
            created_at,
            expires_at
        })
    }
    
    // Get a VALUE from MEMORY
    GET(key: RedisTypes): RedisObject | null {
        
        const res = this.map.get(key)

        // If KEY NOT EXISTS
        if(!res) return null

        // If KEY is EXPIRED
        if(res.expires_at < new Date()) return null

        return res
    }

    // Delete a VALUE from MEMORY
    DEL(key: RedisTypes): void {
        
        this.map.delete(key)
    }

    // Verify if a KEY / VALUE EXISTS
    EXISTS(key: RedisTypes): boolean {
        
        const value = this.map.get(key)

        return value ? true : false
    }

    // Time to Live for a KEY
    TTL(key: RedisTypes): miliseconds {
        
        const res = this.map.get(key)

        if(!res) return 0

        const timeToLive = res.expires_at.getTime() - new Date().getTime()

        return timeToLive
    }
}  

async function main(){

    const redis = new Redis()

    redis.SET(1, 10, 5000)

    console.log(redis.EXISTS(2));

    setTimeout(() => {
        console.log(redis.TTL(1));
    }, 3000)

}

const redisClone = new Redis()

export { redisClone }