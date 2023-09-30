const Model = require("../databaseAPI/Model");
const connection = require("../databaseAPI/Connection");

module.exports.UserModel = new Model("users", ["login", "phone_number", "password", "first_name", "last_name", "avatar_href"], connection);
module.exports.TokenModel = new Model("jwt_tokens", ["access_token", "refresh_token", "users_login"], connection);
module.exports.RestaurantsModel = new Model("restaurants", ["id_restaurants", "location", "rating", "price_rating", "name", "restaurant_image_href"], connection);
module.exports.Specializations = new Model("food_specializations", ["food_specialization"], connection);
module.exports.FoodItems = new Model("food_items", ["id_food_items", "price", "weight", "calories", "name", "proteins", "fats", "carbohydrates", "restaurants_id_restaurants", "food_image_href"], connection);
module.exports.RestsHasSpecs = new Model("food_specializations_has_restaurants", ["food_specializations_food_specialization", "restaurants_id_restaurants"], connection);