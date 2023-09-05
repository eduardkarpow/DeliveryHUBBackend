const Model = require("../databaseAPI/Model");
const connection = require("../databaseAPI/Connection");
const bcrypt = require("bcrypt");
const TokenService = require("./TokenService");

const userModel = new Model("users", ["login", "phone_number", "password", "first_name", "last_name"], connection)

class UserService{
    static async registration(login, password, phone, firstName, lastName){
        const candidate = await userModel.findOne({login: login});
        if(candidate.length){
            throw new Error("User is already exists");
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
        console.log(user);
        if(!user.length){
            throw new Error("User hasn't found");
        }
        user = user[0];
        const isPasswordsEquals = await bcrypt.compare(password, user.password);
        if(!isPasswordsEquals){
            throw new Error("password incorrect");
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
    static async refresh(refreshToken){
        if(!refreshToken){
            throw new Error("Unauthorized");
        }
        const userData = TokenService.validateRefreshToken(refreshToken);
        const tokensFromDB = await TokenService.findToken(refreshToken);
        if(!userData || !tokensFromDB){
            throw new Error("Unauthorized");
        }
        const user = await userModel.findOne({login: userData.login});
        const tokens = TokenService.generateTokens(user.login,
            user.password, user.phone_number, user.first_name, user.last_name);
        await TokenService.saveTokens(user.login, tokens);
        return {
            ...tokens,
            user
        }
    }
}

module.exports = UserService;