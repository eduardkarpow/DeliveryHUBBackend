const {RestaurantsModel, Specializations, FoodItems, RestsHasSpecs} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");
class RestaurantsService{
    static async getAllRestaurants(){
        const specs = await SQLBuilder
            .getAll(RestsHasSpecs.tableName)
            .join(RestsHasSpecs.tableName, Specializations.tableName, RestsHasSpecs.colNames[0], Specializations.colNames[0])
            .join(RestsHasSpecs.tableName, RestaurantsModel.tableName, RestsHasSpecs.colNames[1], "id_restaurants")
            .request();

        const restaurants = Adapter.stackRecords(specs, "id_restaurants", "food_specialization", ["food_specializations_food_specialization", "restaurants_id_restaurants"]);
        return restaurants;
    }
    static async getSpecialRestaurants(special){
        const specs = await SQLBuilder
            .getAll(RestsHasSpecs.tableName)
            .join(RestsHasSpecs.tableName, Specializations.tableName, RestsHasSpecs.colNames[0], Specializations.colNames[0])
            .join(RestsHasSpecs.tableName, RestaurantsModel.tableName, RestsHasSpecs.colNames[1], "id_restaurants")
            .condition(["id_restaurants"], [special["id_restaurants"]])
            .request();
        const restaurants = Adapter.stackRecords(specs, "id_restaurants", "food_specialization", ["food_specializations_food_specialization", "restaurants_id_restaurants"]);
        return restaurants;
    }
    static async getAllSpecializations(){
        const specs = await SQLBuilder
            .getAll(Specializations.tableName)
            .request();
        return specs;
    }
    static async getMenu(restId){
        let menu = await SQLBuilder
            .getAll(FoodItems.tableName)
            .condition(["restaurants_id_restaurants"], [restId])
            .request();
        Adapter.renameCols(menu, {"id": "id_food_items", "image_href": "food_image_href"});
        return menu;
    }
}
module.exports = RestaurantsService;