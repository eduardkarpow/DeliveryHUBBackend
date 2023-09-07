const JWT = require("jsonwebtoken");
const Model = require("../databaseAPI/Model");
const connection = require("../databaseAPI/Connection");

const tokenModel = new Model("jwt_tokens", ["access_token", "refresh_token", "users_login"], connection);
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
        const tokenData = await tokenModel.findOne({users_login: login});
        if(tokenData.length){
            const response = await tokenModel.updateRecord({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken
            }, {users_login: login});
            return response;
        }
        const response = await tokenModel.addRecord({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            users_login: login
        })
        return response;
    }
    static async deleteTokens(login){
        const response = await tokenModel.deleteRecord({users_login: login});
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
        const token = await tokenModel.findOne({refresh_token: refreshToken});
        return token;
    }
}
module.exports = TokenService;