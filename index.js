const express = require("express");
const mysql = require("mysql");
const Model =  require("./databaseAPI/Model");

const app = express();
const PORT = 8000;
app.use(express.json());

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "DeliveryHUB"
})

const tokensModel = new Model("jwt_tokens", ["access_token", "refresh_token", "users_login"], connection);
const usersModel = new Model("users", ["login", "phone_number", "password", "first_name", "last_name"], connection);

app.get("/", (req, res) => {
    res.send("Hello World");

})
app.get("/tokens/getAll", (req, res) => {
    tokensModel.getAll(res);
})
app.post("/tokens/getTokens", (req, res) => {
    tokensModel.findOne(res, req.body);
})
app.post("/tokens/setTokens", (req,res) => {
    tokensModel.addRecord(res, req.body);
})
app.post("/tokens/deleteTokens", (req, res) => {
    tokensModel.deleteRecord(res, req.body);
})
app.post("/tokens/updateTokens", (req, res) => {
    const id = {...req.body["id"]};
    const data = {...req.body}
    delete data.id;
    tokensModel.updateRecord(res, data, id);
})
app.post("/users/setUser", (req,res) => {
    usersModel.addRecord(res, req.body);
})
app.post("/users/getUser", (req,res) => {
    usersModel.findOne(res, req.body);
})
app.listen(PORT, () => {
    console.log("app is up");
})