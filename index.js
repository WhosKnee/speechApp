var express = require("express");
var app = express();

// express looks for ejs files from the ./views folder
app.get("/", function(req, res){
    name = 'husni';
    res.render("home.ejs", {nameEJS: name});
})
app.listen(3000, function(){
    console.log("Sever is listening!");
})