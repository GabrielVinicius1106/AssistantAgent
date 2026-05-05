// Redis Types

export type RedisTypes = string | number | object | boolean

export interface RedisInterface {   
    
    SET(key: RedisTypes, value: RedisTypes, expires_in: number): void
    
    GET(key: RedisTypes): RedisObject | null
    
    DEL(key: RedisTypes): void

    EXISTS(key: RedisTypes): boolean
    
    TTL(key: RedisTypes): number | null

}

export interface RedisObject {
    value: RedisTypes
    expires_at: Date
    created_at: Date
}