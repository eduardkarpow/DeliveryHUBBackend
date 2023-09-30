const JWT = require("jsonwebtoken");
const {TokenModel} = require("../Models/Models");
const {sqlBuilder} = require("../databaseAPI/SQLBuilder");
const SQLBuilder = require("../databaseAPI/SQLBuilder");

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
        const tokenData =  await SQLBuilder
                .getAll(TokenModel.tableName)
                .condition(["access_token"], [tokens.accessToken])
                .request();
        if(tokenData.length){
            const response = await SQLBuilder
                .update(TokenModel.tableName)
                .setValues(["access_token", "refresh_token"], [tokens.accessToken, tokens.refreshToken])
                .condition(["users_login"], [login])
                .request();
            return response;
        }
        const response = await SQLBuilder
            .insert(TokenModel.tableName, TokenModel.colNames)
            .insertValues([tokens.accessToken, tokens.refreshToken, login])
            .request();
        return response;
    }
    static async deleteTokens(login){
        const response = await SQLBuilder
            .delete(TokenModel.tableName)
            .condition(["users_login"], [login])
            .request();
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
        const token = await SQLBuilder
            .getAll(TokenModel.tableName)
            .condition(["refresh_token"], [refreshToken])
            .request();
        return token;
    }
}
module.exports = TokenService;