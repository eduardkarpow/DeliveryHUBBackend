const {RestaurantsModel, Specializations, FoodItems, RestsHasSpecs} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");


class SpecializationsService {
    static async getAllSpecializations(){
        const specs = await (new SQLBuilder())
            .getAll(Specializations.tableName)
            .request();
        return specs;
    }
}
module.exports = SpecializationsService;