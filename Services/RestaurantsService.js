const {RestaurantsModel, Specializations, FoodItems, RestsHasSpecs, ReviewModel} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");

class RestaurantsService{
    static async getAllRestaurants(){
        const specs = await (new SQLBuilder())
            .getAll(RestsHasSpecs.tableName)
            .join(RestsHasSpecs.tableName, Specializations.tableName, RestsHasSpecs.colNames[0], Specializations.colNames[0])
            .join(RestsHasSpecs.tableName, RestaurantsModel.tableName, RestsHasSpecs.colNames[1], "id_restaurants")
            .request();

        let restaurants = Adapter.stackRecords(specs, "id_restaurants", "food_specialization", ["food_specializations_food_specialization", "restaurants_id_restaurants"]);
        restaurants = Adapter.renameCols(restaurants, {"specs": "food_specialization"});
        return restaurants;
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

    static async getMenu(restId){
        let menu = await (new SQLBuilder())
            .getAll(FoodItems.tableName)
            .condition(["restaurants_id_restaurants"], [restId])
            .request();
        Adapter.renameCols(menu, {"id": "id_food_items", "image_href": "food_image_href"});
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

}
module.exports = RestaurantsService;