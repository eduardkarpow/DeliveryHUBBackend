const Model = require("../databaseAPI/Model");
const connection = require("../databaseAPI/Connection");
const bcrypt = require("bcrypt");
const TokenService = require("./TokenService");
const ApiError = require("../Exceptions/index");
const {TokenModel, UserModel} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const fs = require("fs");



class UserService{
    static async registration(login, password, phone, firstName, lastName){
        const candidate = await SQLBuilder
            .getAll(UserModel.tableName)
            .condition(["login"], [login])
            .request();
        if(candidate.length){
            throw ApiError.BadRequest("user is already exists");
        }
        const hashPassword = await bcrypt.hash(password,3);
        const tokens = TokenService.generateTokens({login, hashPassword, phone, firstName, lastName});
        const response = await SQLBuilder
            .insert("users", UserModel.colNames, ["avatar_href"])
            .insertValues([login, phone, hashPassword, firstName, lastName])
            .request();

        const responseTokens = await TokenService.saveTokens(login, tokens);
        return tokens;
    }
    static async logIn(login, password){
        let user = await SQLBuilder
            .getAll(UserModel.tableName)
            .condition(["login"], [login])
            .request();
        if(!user.length){
            throw ApiError.BadRequest("User hasn't found");
        }
        user = user[0];
        const isPasswordsEquals = await bcrypt.compare(password, user.password);
        if(!isPasswordsEquals){
            throw ApiError.BadRequest("password incorrect");
        }
        const tokens = TokenService.generateTokens({login: user.login,
            password: user.password, phone: user.phone_number, firstName: user.first_name, lastName: user.last_name});
        await TokenService.saveTokens(login, tokens);
        return {
            ...tokens,
            user
        };
    }
    static async logout(login){
        await TokenService.deleteTokens(login);
    }
    static isAuth(accessToken){
        const userData = TokenService.validateAccessToken(accessToken);
        if(!userData){
            throw ApiError.UnauthorizedError();
        }
        return userData;
    }
    static async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnauthorizedError();
        }
        const userData = TokenService.validateRefreshToken(refreshToken);

        const tokensFromDB = await TokenService.findToken(refreshToken);
        if(!userData || !tokensFromDB){
            throw ApiError.UnauthorizedError();
        }
        const user = (await SQLBuilder
            .getAll(UserModel.tableName)
            .condition(["login"], [userData.login])
            .request())[0];
        const tokens = TokenService.generateTokens({login: user.login,
            password: user.password, phone: user.phone_number, firstName: user.first_name, lastName: user.last_name});
        await TokenService.saveTokens(user.login, tokens);
        return {
            ...tokens,
            user
        }
    }
    static generateString(length){
        let result = "";
        const characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
        for(let i = 0; i < length; i++){
            result += characters.charAt(Math.floor(Math.random()*characters.length));
        }
        return result;
    }
    static async uploadImage(data){

        let newPath;
        if(data.body.isUploaded === "true"){
            newPath = "images/avatars/"+data.body.login+this.generateString(10)+data.files.image.name;
            await data.files.image.mv(newPath);
        } else{
            newPath = "images/avatars/standart_avatar.png";
        }

        const resp = await SQLBuilder
            .update(UserModel.tableName)
            .setValues(["avatar_href"], [newPath])
            .condition(["login"], [data.body.login])
            .request();
        return newPath
    }
}

module.exports = UserService;