const {ReviewModel, UserModel} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");
const RestaurantsService = require("../Services/RestaurantsService");

class ReviewsService{
    static async addReview(review){
        await (new SQLBuilder())
            .insert(ReviewModel.tableName, Object.keys(review))
            .insertValues(Object.values(review))
            .request();
        return await RestaurantsService.computeRating(review["restaurants_id_restaurants"]);
    }
    static async getAllReviews(restId){
        let reviews = await (new SQLBuilder())
            .getAll(ReviewModel.tableName)
            .join(ReviewModel.tableName, UserModel.tableName, "users_login", "login")
            .condition(["restaurants_id_restaurants"], [restId])
            .request();
        reviews = Adapter.deleteCols(reviews, ["login", "restaurants_id_restaurants", "phone_number", "first_name", "last_name", "password", "users_login"]);

        return reviews;
    }
}
module.exports = ReviewsService;