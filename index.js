const express = require("express");
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const UserService = require("./Services/UserService");
const connection = require("./databaseAPI/Connection");
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const RestaurantService = require("./Services/RestaurantsService");
const sqlBuilder = require("./databaseAPI/SQLBuilder");

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
app.use(cors({credentials: true, origin: "http://localhost:3000"})); //
app.use(express.json()); //utilizes the body-parser package
app.use(cookie_parser());
app.use('/images', express.static('./images'));



app.get("/test", (req, res) => {
    res.send("Hello World");
    sqlBuilder.delete("jwt_tokens").condition(["access_token"], ["adsasdg"]).request();
})
app.post("/register", express.json(), (req, res) => {
    UserService.registration(req.body.login, req.body.password, req.body.phone, req.body.firstName, req.body.lastName)
        .then(tokens => {
            res.cookie("token", tokens.refreshToken, {maxAge: 30*24*60*60});
            res.send(tokens);

        });
});
app.post("/login", (req,res) => [
    UserService.logIn(req.body.login, req.body.password).then(response => {
        res.cookie("token", response.refreshToken, {maxAge: 30*24*60*60});
        res.send(response);

    })
]);
app.post("/logout", (req, res) => {
    UserService.logout(req.body.login).then(resp => res.send(resp));
});
app.get("/refresh", (req, res) => {
    UserService.refresh(req.cookies.token).then(resp => res.send(resp)).catch(error => {
        res.status(error.status);
        res.send({message: error.message});
    });
});
app.post("/uploadImage", fileupload(), (req, res) =>{
    UserService.uploadImage(req).then(resp => res.send({href: resp}));
})
app.get("/getRestaurants", (req, res) => {
    RestaurantService.getAllRestaurants().then(rest => res.send(rest));
})
app.get("/getSpecializations", (req, res) => {
    RestaurantService.getAllSpecializations().then(specs => res.send(specs));
})
app.post("/getSpecialRests", (req, res) => {
    RestaurantService.getSpecialRestaurants(req.body).then(specs => res.send(specs));
})
app.post("/getMenu", (req, res) => {
    RestaurantService.getMenu(req.body.id).then(menu => res.send(menu));
})
app.listen(PORT, () => {
    console.log("app is up");
})