var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

//collect js and css files from the public folder
app.use(express.static(__dirname + "/public"));
app.unsubscribe(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// set up schema
var word = new mongoose.Schema({
    name: String,
    description: String,
    sentence: String,
    image: String
})

var quiz = new mongoose.Schema({
    id: Number,
    name: String,
    // we'll space each word 
    words: String
})

// express looks for ejs files from the ./views folder
app.get("/", function(req, res){
    name = 'husni';
    res.render("home.ejs", {nameEJS: name});
    //res.render("practice.ejs");
})

app.get("/practice", function(req,res){
    res.render("practice.ejs");
})

app.get("/quizzes", function(req,res){
    res.render("quizzes.ejs");
})

app.get("/login", function(req,res){
    res.render("login.ejs");
})

app.get("/signup", function(req, res){
    res.render("signin.ejs");
})

app.listen(3000, function(){
    console.log("Sever is listening!");
})

