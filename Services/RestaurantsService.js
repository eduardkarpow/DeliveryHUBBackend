const {RestaurantsModel, Specializations} = require("../Models/Models");

class RestaurantsService{
    static async getAllRestaurants(){
        const specs = await Specializations.getAllWithRelation({mainTable:"food_specialization", foreignTable: "food_specializations_food_specialization"}, "food_specializations_has_restaurants");
        //console.log(specs);
        const restaurants = await RestaurantsModel.getAll();

        let restSpecs = {};

        for(let el of restaurants){
            restSpecs[el["id_restaurants"]] = [];
        }
        for(let i=0; i < specs.length; i++){

            restSpecs[specs[i]["restaurants_id_restaurants"]].push(specs[i]["food_specialization"]);
        }
        for(let i = 0; i < restaurants.length; i++){
            restaurants[i].specs = restSpecs[restaurants[i]["id_restaurants"]];
        }
        return restaurants;
    }
    static async getSpecialRestaurants(special){
        const specs = await Specializations.getAllWithRelation({mainTable:"food_specialization", foreignTable: "food_specializations_food_specialization"}, "food_specializations_has_restaurants");
        const restaurants = await RestaurantsModel.findOneWithRelation({mainTable: "id_restaurants", foreignTable: "restaurants_id_restaurants"}, "food_specializations_has_restaurants", special);
        let restSpecs = {};

        for(let el of restaurants){
            restSpecs[el["id_restaurants"]] = [];
        }
        for(let i=0; i < specs.length; i++){
            if(restSpecs.hasOwnProperty(specs[i]["restaurants_id_restaurants"])){
                restSpecs[specs[i]["restaurants_id_restaurants"]].push(specs[i]["food_specialization"]);
            }
        }
        for(let i = 0; i < restaurants.length; i++){
            restaurants[i].specs = restSpecs[restaurants[i]["id_restaurants"]];
            delete restaurants[i]["restaurants_id_restaurants"];
            delete restaurants[i]["food_specializations_food_specialization"];
        }
        return restaurants;
    }
    static async getAllSpecializations(){
        const specs = await Specializations.getAll();
        return specs;
    }
}
module.exports = RestaurantsService;