const Model = require("../databaseAPI/Model");
const connection = require("../databaseAPI/Connection");

module.exports.UserModel = new Model("users", ["login", "phone_number", "password", "first_name", "last_name", "avatar_href"], connection);
module.exports.TokenModel = new Model("jwt_tokens", ["access_token", "refresh_token", "users_login"], connection);
module.exports.RestaurantsModel = new Model("restaurants", ["id_restaurants", "location", "rating", "price_rating", "name", "restaurant_image_href"], connection);
module.exports.Specializations = new Model("food_specializations", ["food_specialization"], connection);
module.exports.FoodItems = new Model("food_items", ["id_food_items", "price", "weight", "calories", "name", "proteins", "fats", "carbohydrates", "restaurants_id_restaurants", "food_image_href"], connection);
module.exports.RestsHasSpecs = new Model("food_specializations_has_restaurants", ["food_specializations_food_specialization", "restaurants_id_restaurants"], connection);
module.exports.ReviewModel = new Model("reviews", ["id_reviews","text", "grade", "rating", "restaurants_id_restaurants", "users_login"], connection);
module.exports.OrderModel = new Model("orders", ["id_orders", "price", "payment_method", "location", "users_login", "restaurants_id_restaurants", "order_statuses_order_status", "datetime"], connection);
module.exports.LocationsModel = new Model("user_locations", ["id_user_locations", "location_name", "location", "users_login"], connection);
module.exports.OrderElementsModel = new Model("order_elements", ["id_order_elements", "amount", "orders_id_orders", "food_items_id_food_items"], connection);
module.exports.OrderStatusesModel = new Model("order_statuses", ["order_status"], connection);
module.exports.Ingredients = new Model("ingredients", ["id_ingredients", "name", "ingredient_image_href"], connection);
module.exports.IngrHasFood = new Model("ingredients_has_food_items", ["ingredients_id_ingredients", "food_items_id_food_items"], connection);