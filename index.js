var express = require("express");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");

//collect js and css files from the public folder
app.use(express.static(__dirname + "/public"));
app.unsubscribe(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://enounce:enouncePass@enunce-wx2pl.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true } ).then(() => {
    console.log("Connected to DB!")
}).catch(err => {
    console.log('ERROR:', err.message);
});

// express looks for ejs files from the ./views folder
app.get("/", function(req, res){
    name = 'husni';
    res.render("home.ejs", {nameEJS: name});
})

app.get("/practice", function(req,res){
    res.render("practice.ejs");
})

app.get("/adventures", function(req,res){
    Adventure.find({}, function(err, allAdventures){
        if(err){
            console.log(err);
        } else {
            res.render('adventures.ejs', {adventures:allAdventures});
        }
    })
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




// set up schema
var wordSchema = new mongoose.Schema({
    name: String,
    description: String
})
// 'Word' is the singular version of the data in the collection
var Word = mongoose.model("Word", wordSchema);
/*
var addWord = new Word({
    name: "Align",
    description: "To arrange things in a straight line",
})

addWord.save(function(err, item){
    if(err){
        console.log("word not created");
    } else {
        console.log("word saved");
        console.log(item);
    }
});
*/

var adventureSchema = new mongoose.Schema({
    id: Number,
    name: String,
    description: String,
    // we'll space each word 
    words: [String],
    paragraph: String,
})

var Adventure = mongoose.model("Adventure", adventureSchema);


var addAdventure = new Adventure({
    id: 2,
    name: "Down the RaBbiT hOlE",
    words: ["Tsunami", "Island", "Coup", "Yacht", "Align"],
    description: "And you thought Alice had it bad?",
    paragraph: "Dan was in his yacht while travelling with some friends in the island of Sri Lanka. Little did he know there was a Tsunami on their way."
})

addAdventure.save(function(err, item){
    if(err){
        console.log("word not created");
    } else {
        console.log("word saved");
        console.log(item);
    }
});
