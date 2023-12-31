const {RestaurantsModel, Specializations, FoodItems, RestsHasSpecs, ReviewModel, UserModel, OrderModel} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");
const UserService = require("../Services/UserService");

class RestaurantsService{
    static async getAllRestaurants(){
        const specs = await (new SQLBuilder())
            .getAll(RestsHasSpecs.tableName)
            .join(RestsHasSpecs.tableName, Specializations.tableName, RestsHasSpecs.colNames[0], Specializations.colNames[0])
            .join(RestsHasSpecs.tableName, RestaurantsModel.tableName, RestsHasSpecs.colNames[1], "id_restaurants")
            .request();

        let restaurants = Adapter.stackRecords(specs, "id_restaurants", "food_specialization", ["food_specializations_food_specialization", "restaurants_id_restaurants"]);
        restaurants = Adapter.renameCols(restaurants, {"specs": "food_specialization", "restVisible": "rest_visible"});
        return restaurants;
    }
    static async addRestaurant(data){
        const response = await (new SQLBuilder())
            .insert(RestaurantsModel.tableName, RestaurantsModel.colNames, ["id_restaurants", "rating", "restaurant_image_href", "rest_visible"])
            .insertValues([data.location, data.priceRating, data.name])
            .request();
        return response;
    }
    static async uploadRestaurantImage(data){
        let newPath;
        newPath = "images/restaurants/"+UserService.generateString(10)+data.body.name+".jpg";
        await data.files.image.mv(newPath);
        const resp = await (new SQLBuilder())
            .update(RestaurantsModel.tableName)
            .setValues(["restaurant_image_href"], [newPath])
            .condition(["name"], [data.body.name])
            .request();
        return newPath
    }
    static async getSpecialRestaurants(special){
        const specs = await (new SQLBuilder())
            .getAll(RestsHasSpecs.tableName)
            .join(RestsHasSpecs.tableName, Specializations.tableName, RestsHasSpecs.colNames[0], Specializations.colNames[0])
            .join(RestsHasSpecs.tableName, RestaurantsModel.tableName, RestsHasSpecs.colNames[1], "id_restaurants")
            .condition([Object.keys(special)[0]], [Object.values(special)[0]])
            .request();
        let restaurants = Adapter.stackRecords(specs, "id_restaurants", "food_specialization", ["food_specializations_food_specialization", "restaurants_id_restaurants"]);
        restaurants = Adapter.renameCols(restaurants, {"specs": "food_specialization"});
        return restaurants;
    }
    static async addSpecialization(restId, spec){
        const resp = await (new SQLBuilder())
            .getAll(RestsHasSpecs.tableName)
            .condition(["restaurants_id_restaurants", "food_specializations_food_specialization"], [restId, spec])
            .request()
        if(resp[0]){
            throw new Error("Ресторан уже имеет данную специализацию");
        }
        const response = await (new SQLBuilder())
            .insert(RestsHasSpecs.tableName, RestsHasSpecs.colNames)
            .insertValues([spec, restId])
            .request();
        return response;
    }
    static async getMenu(restId){
        let menu = await (new SQLBuilder())
            .getAll(FoodItems.tableName)
            .condition(["restaurants_id_restaurants"], [restId])
            .request();
        Adapter.renameCols(menu, {"id": "id_food_items", "image_href": "food_image_href", "isVisible": "is_visible"});
        return menu;
    }
    static async computeRating(restId){
        let reviews = await (new SQLBuilder())
            .getAll(ReviewModel.tableName)
            .condition(["restaurants_id_restaurants"], [restId])
            .request();
        const ratings = [];
        for(let review of reviews){
            ratings.push(review["grade"]);
        }
        return await (new SQLBuilder())
            .update(RestaurantsModel.tableName)
            .setValues(["rating"], [ratings.reduce((s,a) => s+a) / ratings.length])
            .condition(["id_restaurants"], [restId])
            .request();

    }
    static async updateRestaurant(restId){
        const response = await (new SQLBuilder())
            .update(RestaurantsModel.tableName)
            .setValues(["rest_visible"], [0])
            .condition(["id_restaurants"], [restId])
            .request();
        const orders = await (new SQLBuilder())
            .getAll(OrderModel.tableName)
            .condition(["restaurants_id_restaurants"], [restId])
            .request();
        let completed = 0;
        for(let order in orders){
            if(order["order_statuses_order_status"] !== "Завершен" && order["order_statuses_order_status"] !== "Отменен"){
                completed++;
            }
        }
        if(!completed){
            await (new SQLBuilder())
                .delete(RestaurantsModel.tableName)
                .condition(["id_restaurants"], [restId])
                .request();
        }
        return response;
    }

}
module.exports = RestaurantsService;