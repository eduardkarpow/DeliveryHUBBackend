const {OrderModel} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
class OrderService {
    static async getAllOrders(userLogin) {
        const orders = await (new SQLBuilder())
            .getAll(OrderModel.tableName)
            .condition(["users_login"], [userLogin])
            .request();
        return orders;

    }
}

module.exports = OrderService;