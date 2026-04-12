export class UnauthorizedError extends Error {
    constructor(){ super("Invalid Refresh Token.") }
}