const express = require("express");
const mysql   = require("mysql");
const sha256  = require("sha256");
const session = require('express-session');

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public")); //folder for images, css, js
app.use(express.urlencoded()); //use to parse data sent using the POST method
app.use(session({ secret: 'any word', cookie: { maxAge: 60000 }}));

// app.use(myMiddleware);

// function myMiddleware(req, res, next){
//   console.log(new Date());
//   next()
// }


//routes
app.get("/", function(req, res){
   //res.send("it works!");
   res.render("login"); 
   
});

app.get("/admin", async function(req, res){
    console.log("authentication: " ,req.session.authenticated); 
    if(req.session.authenticated )//if !authentication -> reroute to login
    {
        let authorList = await getAuthorList();  
        //console.log(authorList);
        res.render("admin", {"authorList":authorList});
       
    }
    else
    {  
        res.render("login");
    }
   
});//END GWT ADMIN

app.post("/loginProcess", function(req, res){
     
   if(req.body.username == "admin" && sha256(req.body.password) == "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b")
   {
       let count = 0; 
       count++;
      console.log("DEBUG - LOGIN PROCESS HIT x" + count); 
       req.session.authenticated = true; 
       res.send({"loginSuccess" : true});
   }
   else if(req.body.username == "test" && sha256(req.body.password) == "f2ca1bb6c7e907d06dafe4687e579fce76b37e4e93b7605022da52e6ccc26fd2")
   {
       res.send("DEBUG - non-admin" );
   }
   else 
    res.send(false); 
});

app.get("/logout", function(req, res){
    req.session.destory(); 
    res.redirect("/"); //take user back to login
    
});

app.get("/addAuthor", function(req, res){
  res.render("newAuthor");
});

app.post("/addAuthor", async function(req, res){
  //res.render("newAuthor");
  let rows = await insertAuthor(req.body);
  console.log(rows);
  //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
  let message = "Author WAS NOT added to the database!";
  if (rows.affectedRows > 0) {
      message= "Author successfully added!";
  }
  res.render("newAuthor", {"message":message});
    
});

app.get("/updateAuthor", async function(req, res){

  let authorInfo = await getAuthorInfo(req.query.authorId);    
  //console.log(authorInfo);
  res.render("updateAuthor", {"authorInfo":authorInfo});
});

app.post("/updateAuthor", async function(req, res){
  let rows = await updateAuthor(req.body);
  
  let authorInfo = req.body;
  console.log(rows);
  //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
  let message = "Author WAS NOT updated!";
  if (rows.affectedRows > 0) {
      message= "Author successfully updated!";
  }
  res.render("updateAuthor", {"message":message, "authorInfo":authorInfo});
    
});

app.get("/deleteAuthor", async function(req, res){
 let rows = await deleteAuthor(req.query.authorId);
 console.log(rows);
  //res.send("First name: " + req.body.firstName); //When using the POST method, the form info is stored in req.body
  let message = "Author WAS NOT deleted!";
  if (rows.affectedRows > 0) {
      message= "Author successfully deleted!";
  }    
    
   let authorList = await getAuthorList();  
   //console.log(authorList);
   res.render("admin", {"authorList":authorList});
});

app.get("/dbTest", function(req, res){

    let conn = dbConnection();
    
    conn.connect(function(err) {
       if (err) throw err;
       console.log("Connected!");
    
       let sql = "SELECT * FROM q_author WHERE sex = 'F'";
    
       conn.query(sql, function (err, rows, fields) {
          if (err) throw err;
          conn.end();
          res.send(rows);
       });
    
    });

});//dbTest

//functions

function insertAuthor(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `INSERT INTO q_author
                        (firstName, lastName, sex)
                         VALUES (?,?,?)`;
        
           let params = [body.firstName, body.lastName, body.gender];
        
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function updateAuthor(body){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `UPDATE q_author
                      SET firstName = ?, 
                          lastName  = ?, 
                                sex = ?
                     WHERE authorId = ?`;
        
           let params = [body.firstName, body.lastName, body.gender, body.authorId];
        
           console.log(sql);
           
           conn.query(sql, params, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}



function deleteAuthor(authorId){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `DELETE FROM q_author
                      WHERE authorId = ?`;
        
           conn.query(sql, [authorId], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}
function getAuthorInfo(authorId){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT *
                      FROM q_author
                      WHERE authorId = ?`;
        
           conn.query(sql, [authorId], function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows[0]); //Query returns only ONE record
           });
        
        });//connect
    });//promise 
}

function getAuthorList(){
   
   let conn = dbConnection();
    
    return new Promise(function(resolve, reject){
        conn.connect(function(err) {
           if (err) throw err;
           console.log("Connected!");
        
           let sql = `SELECT authorId, firstName, lastName 
                        FROM q_author
                        ORDER BY lastName`;
        
           conn.query(sql, function (err, rows, fields) {
              if (err) throw err;
              //res.send(rows);
              conn.end();
              resolve(rows);
           });
        
        });//connect
    });//promise 
}

function dbConnection(){

   let conn = mysql.createConnection({
                 host: "cst336db.space",
                 user: "cst336_dbUser9",
             password: "1zglno",
             database: "cst336_db9"
       }); //createConnection

return conn;

}


//starting server
app.listen(process.env.PORT, process.env.IP, function(){
console.log("Express server is running...");
});