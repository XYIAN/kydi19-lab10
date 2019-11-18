/* global $ */ 
const express = require("express");
const mysql   = require("mysql");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js

//routes
app.get("/", function(req, res){


});//root

app.get("/admin", function(req,res){
    res.send("it works1");
    res.render("admin");
}); 

app.get("/addAuthor", function(req,res){
    res.render("newAuthor");
}); 


// using post method 
app.post("/addAuthor", function(req,res){  
    // res.render("newAuthor");
    //res.send("itworks 2" + req.body.firstName); 
}); 



//starting server
app.listen(process.env.PORT, process.env.IP, function(){
    var num =2; var fill = 2; 
    console.log("Hello Mr. Dilbeck, server is booting up");
    for(let i = 0 ; i < num; i++)
    {
        console.log("opening " + i*fill);
        
    }
console.log("Express server is running...");
});