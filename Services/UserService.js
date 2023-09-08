const Model = require("../databaseAPI/Model");
const connection = require("../databaseAPI/Connection");
const bcrypt = require("bcrypt");
const TokenService = require("./TokenService");
const ApiError = require("../Exceptions/index");


const userModel = new Model("users", ["login", "phone_number", "password", "first_name", "last_name"], connection)

class UserService{
    static async registration(login, password, phone, firstName, lastName){
        const candidate = await userModel.findOne({login: login});
        if(candidate.length){
            throw ApiError.BadRequest("user is already exists");
        }
        const hashPassword = await bcrypt.hash(password,3);
        const response = await userModel.addRecord({login: login,
            phone_number: phone,
            password: hashPassword,
            first_name: firstName,
            last_name: lastName
        })
        const tokens = TokenService.generateTokens({login, hashPassword, phone, firstName, lastName});
        const responseTokens = await TokenService.saveTokens(login, tokens);
        return tokens;
    }
    static async logIn(login, password){
        let user = await userModel.findOne({login: login});
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
        const user = (await userModel.findOne({login: userData.login}))[0];
        const tokens = TokenService.generateTokens({login: user.login,
            password: user.password, phone: user.phone_number, firstName: user.first_name, lastName: user.last_name});
        await TokenService.saveTokens(user.login, tokens);
        return {
            ...tokens,
            user
        }
    }
}

module.exports = UserService;