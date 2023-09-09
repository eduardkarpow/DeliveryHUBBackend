const Model = require("../databaseAPI/Model");
const connection = require("../databaseAPI/Connection");

module.exports.UserModel = new Model("users", ["login", "phone_number", "password", "first_name", "last_name", "jwt_token_access_token"], connection);
module.exports.TokenModel = new Model("jwt_tokens", ["access_token", "refresh_token"], connection);