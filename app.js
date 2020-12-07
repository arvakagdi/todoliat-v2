// README
// Please run npm i from the folder to install node_modules the first time you run the project
// Also in this version I am working on using database for my todo list. For detailed commented version of todo list refer to todolist v1 repo

//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const _ = require("lodash");

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


const listSchema = new mongoose.Schema({    // Make a new list Schema 
  name:String,
  items:[itemsSchema]     // item will refer to itemSchema
})

const List = mongoose.model("list", listSchema);  // model for lists

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


//changing the post method to post to multiple list pages
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const newitem = new Item({
    name:itemName
  }); 

  if (listName === "Today"){    // If it is the home page save the item to items collection
    newitem.save();
    res.redirect("/");
  }

  // If req was from any other page, find the item and add the curr item to the item list of the item
  else{
    List.findOne({name:listName},function(err,result){
      if(!err){
        result.items.push(newitem)   // as the List collection's items is of type itemSchema
        result.save();
        res.redirect("/" + listName)
      }
    });
  }
});


// when an item is checked off, we added action to /delete and now we can access _id of the item checked through the chdeckbox value
app.post("/delete", function(req,res){
  const deleteItemID = req.body.checkbox;    // get the id
  const listName = req.body.listName;

  if (listName === "Today"){    // if request was made from home page, delete from items collection
    Item.deleteOne({_id:deleteItemID}, function(err){   //delete the entry
      if(!err){
        console.log("deleted successfully!");
        res.redirect("/");    //redirect on homepage to see changes
      }
    });
  }
  else{  // if req was made from any other page
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:deleteItemID}}},function(err, foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    });
  }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req,res){      // express route parameter 
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,result){
    if(!err){
      if(!result){
        const list = new List({                              
          name:customListName,
          items: defaultItems
        })  
        list.save();
        res.redirect("/" + customListName);
      }
      else{
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
  });

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});