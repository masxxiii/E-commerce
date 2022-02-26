/* modules */
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

/* app */
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
var path = __dirname + "/views/";

/* setting up ejs */
app.set('view engine','ejs');

/* connecting moongoose to our database */
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser:true, useUnifiedTopology: true });

/* user schema */
const userSchema = {
    name: String,
    email: String,
    password: String
}

/* product schema */
const proSchema = {
    seller: String,
    name: String,
    price: String,
    link1: String,
    link2: String,
    des: String
}

/* wishlist schema */
const wishSchema = {
    user: String,
    product: String,
    seller: String
}

/* cart schema */
const cartSchema = {
    user: String,
    product: String,
    seller: String
}

const User = new mongoose.model("User",userSchema);
const Product = new mongoose.model("Product",proSchema);
const Wishlist = new mongoose.model("Wishlist",wishSchema);
const Cart = new mongoose.model("Cart",cartSchema);

/* setting up ejs */
app.set('view engine','ejs');

/* user variable to roam around webpages */
var un = "";

app.get("/",function(req,res){

    Product.find({},function(err,result){
        if (err)
        {
            console.log(err);
        }
        else
        {
            res.render("home", {
                foundProducts: result
            });
        }
    });
});

app.get("/v",function(req,res){

    Product.find({},function(err,result){
        if (err)
        {
            console.log(err);
        }
        else
        {
            res.render("verified", {
                user: un,
                foundProducts: result
            });
        }
    });
});

app.get("/login",function(req,res){
    res.render("signin");
});

app.get("/logout",function(req,res){
    un = "";
    res.redirect("/");
});

app.get("/register",function(req,res){
    res.render("signup");
});

app.get("/add",function(req,res){
    res.render("add");
});

app.get("/wishlist",function(req,res){


    Wishlist.find({user: un},function(err,result){
        if (err)
        {
            console.log(err);
        }
        else
        {
            Wishlist.countDocuments({user: un}, function(error, c)
            {
                res.render("wishlist", {
                    foundWishlist: result,
                    name: un,
                    countMax: c,
                    countMin: 1
                });
            });
        }
    });

});

app.get("/cart",function(req,res){

    Cart.find({user: un},function(err,result){
        if (err)
        {
            console.log(err);
        }
        else
        {
            Cart.countDocuments({user: un}, function(error, c)
            {
                res.render("cart", {
                    foundCart: result,
                    name: un,
                    countMax: c,
                    countMin: 1
                });
            });
        }
    });

});

app.get("/:randomProduct", function(req, res){

    const id = req.params.randomProduct;
    
    Product.findOne({_id: id},function(err,result){
        if (err)
        {
            console.log(err);
        }
        else
        {
            if(un === "")
            {
                res.render("product", {
                    img: result.link1,
                    name: result.name,
                    seller: result.seller,
                    des: result.des
                });
            }
            else
            {
                res.render("productVerified", {
                    img: result.link1,
                    name: result.name,
                    seller: result.seller,
                    des: result.des,
                    id: result._id
                });
            }
        }
    });

});

app.get("/wish/:id", function(req, res){

    const id = req.params.id

    Product.findOne({_id: id},function(err,result){
        if (err)
        {
            console.log(err);
        }
        else
        {
            const newWish = new Wishlist ({
                user: un,
                product: result.name,
                seller: result.seller
            });
        
            newWish.save(function(err){
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Wish added!");
                    res.redirect("/v");
                }
            })
        }
    });
});

app.get("/cart/:id", function(req, res){

    const id = req.params.id

    Product.findOne({_id: id},function(err,result){
        if (err)
        {
            console.log(err);
        }
        else
        {
            const newCart = new Cart ({
                user: un,
                product: result.name,
                seller: result.seller
            });
        
            newCart.save(function(err){
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Item added to cart!");
                    res.redirect("/v");
                }
            })
        }
    });
});

app.get("/clearWish/:requests", function(req, res){

    const name = req.params.requests

    Wishlist.deleteMany({ user: name }, function(err){
        if (!err) {
          console.log("Successfully deleted wish list!");
          res.redirect("/v");
        }
      });

});

app.get("/clearCart/:requests", function(req, res){

    const name = req.params.requests

    Cart.deleteMany({ user: name }, function(err){
        if (!err) {
          console.log("Successfully deleted cart!");
          res.redirect("/v");
        }
      });

});

app.post("/register",function(req,res){

    const newUser = new User ({
        name: req.body.name,
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if (err) {
            console.log(err);
        }
        else {
            console.log("User created!");
            res.redirect("/");
        }
    })

});

app.post("/add",function(req,res){

    const newProduct = new Product ({
        seller: un,
        name: req.body.name,
        price: req.body.price,
        link1: req.body.link1,
        link2: req.body.link2,
        des: req.body.des
    });

    newProduct.save(function(err){
        if (err) {
            console.log(err);
        }
        else {
            console.log("Product added!");
            res.redirect("/add");
        }
    })

});

app.post("/login",function(req,res){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){

        if (err){
            console.log(err);
        }
        else {
            if (foundUser) {
                if (foundUser.password === password) {
                    un = foundUser.name;
                    Product.find({},function(err,result){
                        if (err)
                        {
                            console.log(err);
                        }
                        else
                        {
                            res.render("verified", {
                                user: un,
                                foundProducts: result
                            });
                        }
                    });
                }
                else if (foundUser.password !== password) {
                    res.redirect("/login")
                }
            }
        }
    })

});

app.listen(3000,function(){
    console.log("Server is running!");
});
