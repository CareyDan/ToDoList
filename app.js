//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });
const uri = "mongodb+srv://Admin-Carey:test123@cluster0.25aqz.mongodb.net/todolistDB?retryWrites=true&w=majority";
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true });

// const { MongoClient } = require('mongodb');
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("todolistDB").collection("lists");
//   // perform actions on the collection object
//   //client.close();
// });

const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item ({
  name: "Welcome to you todolist!"
});
const item2 = new Item ({
  name: "Hit the + button to add a new item."
});
const item3 = new Item ({
  name: "<--- Hit this to delete an item."
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/:paramRoute",(req,res)=>{
  block: {
  const listName = _.capitalize(req.params.paramRoute);
  if (listName === "Favicon.ico" || listName === "ads.txt" ||
      listName === "robots.txt" || listName === "humans.txt" || listName === "sitemap.xml") {
    console.log("Received bad route: " + listName);
    break block;
  }

  List.findOne({name: listName}, (err, foundList)=>{
    if (err) {
      console.log(err);
    } else if (!foundList) {
      console.log("List: " + listName + " not found, creating.");
      const newList = new List({
        name: listName,
        items: defaultItems
      });
      List.create(newList);
      res.redirect("/" + listName);
    } else {
      console.log("Found list: " + listName);
      console.log(foundList.name);
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
    });
  }  //block label
});

app.get("/", function(req, res){
  Item.find({}, (err, foundItems)=>{
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err)=>{
        if (err) {
          console.log(err);
        } else {
          console.log("Insert items successful");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});

app.post("/delete", (req,res)=>{
  var checkedItemId = req.body.checkbox;
  var listName = req.body.listName;

   if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err)=>{
      if (!err) {
        res.redirect("/");
      }
    });
   } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList)=>{
      if (!err) {
        res.redirect("/" + listName);
      }
    });
   }
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    Item.create(newItem);
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
