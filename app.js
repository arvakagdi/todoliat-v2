// README
// Please run npm i from the folder to install node_modules the first time you run the project
// Also in this version I am working on using database for my todo list. For detailed commented version of todo list refer to todolist v1 repo


//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });    //create database named todoDB and connect to mongodb server

// create a mongoose schema
const itemsSchema = new mongoose.Schema({
  name:String
});

// create a mongoose model
const Item = mongoose.model('Item', itemsSchema);  // model is Item , 1st parameter is singular version of our collection name, second is the schema we will use


// Create the default 3 items to be added to your todo list
const item1 = new Item({
  name: "Welcome to your to-do list!"
})

const item2 = new Item({
  name: "Hit + to add a new item."
})
  
const item3 = new Item({
  name: "Hit <-- to delete an item."
})

const defaultItems = [item1,item2,item3];



app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){

    // we need to make a check on found items as if we keep the insertMany without nay check we will keep adding the default items
    // every time we access the server. So if we don't have anything in our list we add the default items to the list and redirect to the main page
    // now when we reach main page we do have find items so we will go to else and render the list.ejs page

    if (foundItems.length === 0){  
      // Inserting default items to the items collection
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log('update default items to DB successfully.');
        }
      })
      res.redirect("/");      //redirect to home page    
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

  })
  

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
