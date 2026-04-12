export interface RefreshToken {
    id: string
    token: string
    created_at: Date
    expires_at: Date
    revoked: boolean
    
    user_id: string
}