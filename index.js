var express = require("express");
var app = express();

//collect js and css files from the public folder
app.use(express.static(__dirname + "/public"));

// express looks for ejs files from the ./views folder
app.get("/", function(req, res){
    name = 'husni';
    res.render("home.ejs", {nameEJS: name});
    //res.render("usegoogle2.ejs");
    //res.render("google_with_rec.ejs");

})

app.listen(3000, function(){
    console.log("Sever is listening!");
})

