const express = require("express");
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const UserService = require("./Services/UserService");
const connection = require("./databaseAPI/Connection");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const RestaurantService = require("./Services/RestaurantsService");
const sqlBuilder = require("./databaseAPI/SQLBuilder");
const SpecializationsService = require("./Services/SpecializationsService");
const ReviewsService = require("./Services/ReviewsService");
const OrderService = require("./Services/OrderService");
const LocationsService = require("./Services/LocationsService");
const FoodService = require("./Services/FoodService");
const IngredientsService = require("./Services/FoodService");

const app = express();
const PORT = 8000;
/*let allowCors = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Credentials', 'true');

    next();
}*/
//app.use(allowCors);
app.use(cors({credentials: true, origin: "http://localhost:3000", allowedHeaders: ['Content-Type', 'authorization']})); //
app.use(express.json()); //utilizes the body-parser package
app.use(cookie_parser());
app.use('/images', express.static('./images'));



app.post("/register", express.json(), (req, res) => {
    UserService.registration(req.body.login, req.body.password, req.body.phone, req.body.firstName, req.body.lastName)
        .then(tokens => {
            res.cookie("token", tokens.refreshToken, {maxAge: 30*24*60*60});
            res.send(tokens);

        }).catch(error => {
            res.status(error.status);
            res.send({message: error.message});
        });
});
app.post("/login", (req,res) => [
    UserService.logIn(req.body.login, req.body.password).then(response => {
        res.cookie("token", response.refreshToken, {maxAge: 30*24*60*60});
        res.send(response);

    }).catch(error => {
        res.status(error.status);
        res.send({message: error.message});
    })
]);
app.post("/logout", (req, res) => {
    UserService.logout(req.body.login).then(resp => res.send(resp));
});
app.post("/refresh", (req, res) => {
    UserService.refresh(req.cookies.token).then(resp => res.send(resp)).catch(error => {
        res.status(402);
        res.send({message: "not authorized"});//res.redirect(302, "https://www.google.com");//http://localhost:3000/login
    });
});
app.post("/uploadImage", fileupload(), (req, res) =>{
    UserService.uploadImage(req).then(resp => res.send({href: resp}));
})
app.get("/getRestaurants", (req, res) => {
    RestaurantService.getAllRestaurants().then(rest => res.send(rest));
})
app.post("/addRestaurant", (req, res) => {
    RestaurantService.addRestaurant(req.body).then(resp => res.send(resp));
})
app.post("/uploadRestaurantImage", fileupload(), (req, res) =>{
    RestaurantService.uploadRestaurantImage(req).then(resp => res.send({href: resp}));
})
app.post("/addSpecializationToRestaurant", (req, res) => {
    RestaurantService.addSpecialization(req.body.restId, req.body.spec).then(resp => res.send(resp));
})
app.get("/getSpecializations", (req, res) => {
    SpecializationsService.getAllSpecializations().then(specs => res.send(specs));
})
app.post("/getSpecialRests", (req, res) => {
    RestaurantService.getSpecialRestaurants(req.body).then(specs => res.send(specs));
})
app.post("/getMenu", (req, res) => {
    RestaurantService.getMenu(req.body.id).then(menu => res.send(menu));
})
app.post("/addReview", (req, res) => {
    ReviewsService.addReview(req.body).then(resp => res.send(resp));
})
app.post("/getAllReviews", (req, res) => {
    ReviewsService.getAllReviews(req.body.id).then(resp => res.send(resp));
})
app.post("/getOrders", (req, res) => {
    OrderService.getAllOrders(req.body.login).then(resp => res.send(resp));
})
app.post("/getLocations", (req, res) => {
    LocationsService.getAllLocations(req.body.login).then(resp => res.send(resp));
})
app.post("/addLocation", (req, res) => {
    LocationsService.createLocation(req.body.login, req.body.locationName, req.body.location).then(resp => res.send(resp));
})
app.post("/addOrder", (req, res) => {
    OrderService.addOrder(req.body.price, req.body.paymentMethod, req.body.location, req.body.login, req.body.restaurantId, req.body.orderStatus, req.body.datetime).then(resp => res.send(resp));
})
app.post("/addOrderElement", (req, res) => {
    OrderService.addOrderElement(req.body.amount, req.body.order_id, req.body.food_item_id).then(resp => res.send(resp));
})
app.post("/getOrderInfo", (req, res) => {
    OrderService.getOrderInfo(req.body.id).then(resp => res.send(resp));
})
app.post("/getOrderElements", (req, res) => {
    OrderService.getOrderElements(req.body.orderId).then(resp => res.send(resp));
})
app.get("/getAllOrders", (req, res) => {
    OrderService.getOrdersAndStatuses().then(resp => res.send(resp));
})
app.post("/updateOrderStatus", (req, res) => {
    OrderService.updateOrderStatus(req.body.id, req.body.status).then(resp => res.send(resp));
})
app.post("/getFoodInfo", (req, res) => {
    FoodService.getFoodInfo(req.body.id).then(resp => res.send(resp));
})
app.post("/getFoods", (req, res) => {
    FoodService.getFoodList(req.body.restId).then(resp => res.send(resp));
})
app.post("/addFoodInfo", (req, res) => {
    FoodService.addFoodItem(req.body).then(resp => res.send(resp));
})
app.post("/uploadFoodImage", fileupload(), (req, res) =>{
    FoodService.uploadFoodImage(req).then(resp => res.send({href: resp}));
})
app.post("/deleteFood", (req, res) => {
    FoodService.deleteFoodItem(req.body.foodId).then(resp => res.send(resp));
})
app.post("/getIngredients", (req, res) => {
    FoodService.getIngredients(req.body.foodId).then(resp => res.send(resp));
})
app.post("/addIngredient", (req, res) => {
    FoodService.addIngredient(req.body.foodId, req.body.ingredientId).then(resp => res.send(resp));
})
app.post("/addIngredientItem", (req, res) => {
    FoodService.addIngredientItem(req.body).then(resp => res.send(resp));
})
app.post("/uploadIngredientImage", fileupload(), (req, res) =>{
    FoodService.uploadIngredientImage(req).then(resp => res.send({href: resp}));
})
app.post("/deleteIngredient", (req, res) => {
    FoodService.deleteIngredient(req.body.foodId, req.body.ingredientId).then(resp => res.send(resp));
})
app.listen(PORT, () => {
    console.log("app is up");
})