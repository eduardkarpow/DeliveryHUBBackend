const JWT = require("jsonwebtoken");
const {TokenModel, UserModel} = require("../Models/Models");


class TokenService{
    static generateTokens(payload) {
        const accessToken = JWT.sign(payload, "process.env.SECRET_JWT_ACCESS_KEY", {expiresIn: "10s"});
        const refreshToken = JWT.sign(payload, "process.env.SECRET_JWT_REFRESH_KEY", {expiresIn: "30d"});
        return {
            accessToken,
            refreshToken
        }
    }
    static async saveTokens(login, tokens){
        const tokenData = await TokenModel.findOne({access_token: tokens.accessToken});
        if(tokenData.length){
            const response = await TokenModel.updateRecord({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken
            }, {users_login: login});
            return response;
        }
        const response = await TokenModel.addRecord({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            users_login: login
        })
        return response;
    }
    static async deleteTokens(login){
        const response = await TokenModel.deleteRecord({users_login: login});
        return response;
    }
    static validateAccessToken(token){
        try{
            const userData = JWT.verify(token, "process.env.SECRET_JWT_ACCESS_KEY");
            return userData;
        } catch (e) {
            throw e;
        }
    }
    static validateRefreshToken(token){
        try{
            const userData = JWT.verify(token, "process.env.SECRET_JWT_REFRESH_KEY");
            return userData;
        } catch (e) {
            throw e;
        }
    }
    static async findToken(refreshToken){
        const token = await TokenModel.findOne({refresh_token: refreshToken});
        return token;
    }
}
module.exports = TokenService;