const express = require("express");
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const UserService = require("./Services/UserService");
const connection = require("./databaseAPI/Connection");

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use(cookie_parser());




app.get("/", (req, res) => {
    res.send("Hello World");

})
app.post("/register", (req, res) => {
    UserService.registration(req.body.login, req.body.password, req.body.phone, req.body.firstName, req.body.lastName)
        .then(tokens => res.send(tokens));
});
app.post("/login", (req,res) => [
    UserService.logIn(req.body.login, req.body.password).then(response => res.send(response))
]);
app.post("/logout", (req, res) => {
    UserService.logout(req.body.login).then(resp => res.send(resp));
});
app.post("/refresh", (req, res) => {
    UserService.refresh(req.body.refreshToken).then(resp => res.send(resp));
});
app.listen(PORT, () => {
    console.log("app is up");
})