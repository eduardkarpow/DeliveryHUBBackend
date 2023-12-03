const {OrderModel, OrderElementsModel, RestaurantsModel, OrderStatusesModel, FoodItems} = require("../Models/Models");
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
    static async getOrderInfo(order_id){
        let response = await (new SQLBuilder())
            .getAll(OrderModel.tableName)
            .join(OrderModel.tableName, RestaurantsModel.tableName, "restaurants_id_restaurants", "id_restaurants")
            .join(OrderModel.tableName, OrderStatusesModel.tableName, "order_statuses_order_status", "order_status")
            .condition(["id_orders"], [order_id])
            .request();
        response = Adapter.deleteCols(response, ["payment_method", "location", "users_login", "restaurants_id_restaurants", "order_statuses_order_status",
            "rating", "price_rating"]);
        response = Adapter.renameCols(response, {"restId": "id_restaurants", "id": "id_orders", "fullPrice": "price", "restImage": "restaurant_image_href", "status":"order_status", "statusColor": "status_color"});
        let elements = await (new SQLBuilder())
            .getAll(OrderElementsModel.tableName)
            .join(OrderElementsModel.tableName, FoodItems.tableName, "food_items_id_food_items", "id_food_items")
            .condition(["orders_id_orders"], [order_id])
            .request();
        elements = Adapter.deleteCols(elements, ["orders_id_orders", "food_items_id_food_items", "weight", "fats", "proteins", "calories", "carbohydrates", "restaurants_id_restaurants"]);
        elements = Adapter.renameCols(elements, {"foodId": "id_food_items", "id": "id_order_elements", "image": "food_image_href"});
        response[0].orderElements = elements;
        return response[0];
    }
    static async getOrdersAndStatuses(id){
        let orders = await (new SQLBuilder())
            .getAll(OrderModel.tableName)
            .join(OrderModel.tableName, RestaurantsModel.tableName, "restaurants_id_restaurants", "id_restaurants")
            .request();
        orders = Adapter.deleteCols(orders, ["payment_method", "location", "users_login", "restaurants_id_restaurants", "price", "datetime", "rating", "price_rating", "name", "id_restaurants"]);
        orders = Adapter.renameCols(orders, {"id": "id_orders", "status":"order_statuses_order_status", "image": "restaurant_image_href"});
        let statuses = await (new SQLBuilder())
            .getAll(OrderStatusesModel.tableName)
            .request();
        statuses = Adapter.deleteCols(statuses, ["status_color"]);
        statuses = Adapter.renameCols(statuses, {"status": "order_status"});
        statuses = statuses.map(el => el.status);
        return {orders: orders, statuses: statuses};
    }
    static async updateOrderStatus(id, status){
        const response = await (new SQLBuilder())
            .update(OrderModel.tableName)
            .setValues(["order_statuses_order_status"], [status])
            .condition(["id_orders"], [id])
            .request();
        return response;
    }
}


module.exports = OrderService;