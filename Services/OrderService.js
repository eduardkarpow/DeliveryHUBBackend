const {OrderModel, OrderElementsModel, RestaurantsModel, OrderStatusesModel} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");
class OrderService {
    static async getAllOrders(userLogin) {
        let orders = await (new SQLBuilder())
            .getAll(OrderModel.tableName)
            .join(OrderModel.tableName, RestaurantsModel.tableName, "restaurants_id_restaurants", "id_restaurants")
            .join(OrderModel.tableName, OrderStatusesModel.tableName, "order_statuses_order_status", "order_status")
            .condition(["users_login"], [userLogin])
            .request();
        orders = Adapter.deleteCols(orders,
            ["order_statuses_order_status", "users_login",
                "restaurants_id_restaurants", ...RestaurantsModel.colNames.slice(0,-2)]);
        return orders;

    }
    static async addOrder(price, paymentMethod, location, userLogin, restaurantId, orderStatus, datetime){
        await (new SQLBuilder())
            .insert(OrderModel.tableName, OrderModel.colNames, ["id_orders"])
            .insertValues([price, paymentMethod, location, userLogin, restaurantId, orderStatus, datetime])
            .request();
        const response = (await this.getOrderId(userLogin));
        return response[response.length-1];
    }
    static async addOrderElement(amount, order_id, food_item_id){
        const response = await (new SQLBuilder())
            .insert(OrderElementsModel.tableName, OrderElementsModel.colNames, ["id_order_elements"])
            .insertValues([amount, order_id, food_item_id])
            .request();
        return response;
    }
    static async getOrderId(login){
        const response = await (new SQLBuilder())
            .getAll(OrderModel.tableName)
            .condition(["users_login"], [login])
            .request();
        return response;
    }
}

module.exports = OrderService;