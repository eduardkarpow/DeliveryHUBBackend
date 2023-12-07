const {FoodItems, IngrHasFood, Ingredients} = require("../Models/Models");
const SQLBuilder = require("../databaseAPI/SQLBuilder");
const Adapter = require("../databaseAPI/Adapter");
const UserService = require("./UserService");
class FoodService{
    static async getFoodInfo(id){
        let response = await (new SQLBuilder())
            .getAll(FoodItems.tableName)
            .condition(["id_food_items"], [id])
            .request();
        response = Adapter.deleteCols(response, ["restaurants_id_restaurants", "price", "is_visible"]);
        response = Adapter.renameCols(response, {"id": "id_food_items", "image": "food_image_href"});
        let ingredients = await (new SQLBuilder())
            .getAll(IngrHasFood.tableName)
            .join(IngrHasFood.tableName, Ingredients.tableName, "ingredients_id_ingredients", "id_ingredients")
            .condition(["food_items_id_food_items"], [id])
            .request();

        ingredients = Adapter.deleteCols(ingredients, ["food_items_id_food_items", "ingredients_id_ingredients"]);
        ingredients = Adapter.renameCols(ingredients, {"id": "id_ingredients", "image": "ingredient_image_href"});
        response[0].ingredients = ingredients;
        return response[0];
    }
    static async getFoodList(restId){
        const resp = await (new SQLBuilder())
            .getAll(FoodItems.tableName)
            .condition(["restaurants_id_restaurants"], [restId])
            .request();
        let data = Adapter.deleteCols(resp, [ "price", "weight", "calories", "proteins", "fats", "carbohydrates", "restaurants_id_restaurants"]);
        data = Adapter.renameCols(data, {"id": "id_food_items", "image": "food_image_href", "isVisible": "is_visible"});
        return data;

    }
    static async addFoodItem(data){
        const resp = await (new SQLBuilder())
            .insert(FoodItems.tableName, FoodItems.colNames, ["id_food_items", "food_image_href", "is_visible"])
            .insertValues([data.price, data.weight, data.calories, data.name, data.proteins, data.fats, data.carbohydrates, data.restId])
            .request();
        return resp;
    }
    static async uploadFoodImage(data){
        let newPath;
        newPath = "images/foods/"+UserService.generateString(10)+data.files.image.name;
        await data.files.image.mv(newPath);
        const resp = await (new SQLBuilder())
            .update(FoodItems.tableName)
            .setValues(["food_image_href"], [newPath])
            .condition(["name"], [data.body.name])
            .request();
        return newPath
    }
    static async deleteFoodItem(id){
        const resp = await (new SQLBuilder())
            .update(FoodItems.tableName)
            .setValues(["is_visible"], [0])
            .condition(["id_food_items"], [id])
            .request();
        return resp;
    }
    static async getIngredients(foodId){
        const resp = await (new SQLBuilder())
            .getAll(Ingredients.tableName)
            .request();
        let ingredients = Adapter.renameCols(resp, {"id": "id_ingredients", "image": "ingredient_image_href"});
        let foodIngredients = await (new SQLBuilder())
            .getAll(IngrHasFood.tableName)
            .join(IngrHasFood.tableName, Ingredients.tableName, "ingredients_id_ingredients", "id_ingredients")
            .condition(["food_items_id_food_items"], [foodId])
            .request();
        foodIngredients = Adapter.deleteCols(foodIngredients, ["food_items_id_food_items", "ingredients_id_ingredients"]);
        foodIngredients = Adapter.renameCols(foodIngredients, {"id": "id_ingredients", "image": "ingredient_image_href"});
        return {ingredients:ingredients, foodIngredients:foodIngredients};
    }
    static async addIngredient(foodId, ingredientId){
        try{
            const ingr = await (new SQLBuilder())
                .getAll(Ingredients.tableName)
                .condition(["id_ingredients"], [ingredientId])
                .request()
            if(!ingr[0]){
                throw new Error();
            }
            const resp = await (new SQLBuilder())
                .insert(IngrHasFood.tableName, IngrHasFood.colNames)
                .insertValues([ingredientId, foodId])
                .request();
            return resp;
        } catch(e){
            throw e;
        }

    }
    static async addIngredientItem(data){
        const resp = await (new SQLBuilder())
            .insert(Ingredients.tableName, Ingredients.colNames, ["id_ingredients", "ingredient_image_href"])
            .insertValues([data.name])
            .request();
        const id = (await (new SQLBuilder())
            .getAll(Ingredients.tableName)
            .condition(["name"], [data.name])
            .request())[0]["id_ingredients"];
        const resp2 = await (new SQLBuilder())
            .insert(IngrHasFood.tableName, IngrHasFood.colNames)
            .insertValues([id, data.foodId])
            .request();
        return resp2;
    }
    static async uploadIngredientImage(data){
        let newPath;
        newPath = "images/ingredients/"+UserService.generateString(10)+data.files.image.name;
        await data.files.image.mv(newPath);
        const resp = await (new SQLBuilder())
            .update(Ingredients.tableName)
            .setValues(["ingredient_image_href"], [newPath])
            .condition(["name"], [data.body.name])
            .request();
        return newPath
    }
    static async deleteIngredient(foodId, ingredientId){
        const resp = await (new SQLBuilder())
            .delete(IngrHasFood.tableName)
            .condition(["food_items_id_food_items", "ingredients_id_ingredients"], [foodId, ingredientId])
            .request();
        return resp;
    }
}
module.exports = FoodService;