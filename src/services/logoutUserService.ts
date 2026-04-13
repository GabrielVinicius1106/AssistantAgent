import { LogoutUserInput } from "@/interfaces/LogoutUser.js";
import { RefreshTokensRepositoryInterface } from "@/repositories/RefreshTokensRepositoryInterface.js";

export class LogoutUserService {

    constructor(private refreshTokensRepository: RefreshTokensRepositoryInterface){}

    async execute({ token }: LogoutUserInput){

        const refresh_token = await this.refreshTokensRepository.findByToken(token)

        // Invalid Token ALREADY DELETED
        if(!refresh_token) return

        const token_id = refresh_token.id

        await this.refreshTokensRepository.delete(token_id)

        return
    }

}