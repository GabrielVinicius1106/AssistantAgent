export class TokenExpiredError extends Error {
    constructor(){ super("Expired Token.") }
}