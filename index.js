const express = require("express");
const cors = require("cors");
const cookie_parser = require("cookie-parser");
const UserService = require("./Services/UserService");
const connection = require("./databaseAPI/Connection");

const app = express();
const PORT = 8000;

app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));
app.use(express.json());
app.use(cookie_parser());




app.get("/test", (req, res) => {
    res.send("Hello World");

})
app.post("/register", (req, res) => {
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
app.listen(PORT, () => {
    console.log("app is up");
})