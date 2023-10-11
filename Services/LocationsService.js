const {LocationsModel} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");

class LocationsService{
    static async getAllLocations(login){
        const locations = await (new SQLBuilder())
            .getAll(LocationsModel.tableName)
            .condition(["users_login"], [login])
            .request();
        Adapter.renameCols(locations, {"locationName": "location_name"});
        return locations;
    }
    static async createLocation(login, locationName, location){
        const resp = await (new SQLBuilder())
            .insert(LocationsModel.tableName, LocationsModel.colNames, ["id_user_locations"])
            .insertValues([locationName, location, login])
            .request();
        return resp;
    }
}
module.exports = LocationsService;