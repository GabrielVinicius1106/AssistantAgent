export class UserAlreadyExistsError extends Error {
    // super("Email Already Exists.") => INICIALIZA a classe EXTENDIDA (Error)  
    constructor(){ super("Email Already Exists.") }
}