export class InvalidPasswordLengthError extends Error {
    constructor(){ super("Password Must Contain at Least 8 Characters.") }
}