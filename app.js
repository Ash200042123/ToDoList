//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ashfaq:ashfaq1234@todolistdb.xyiz68i.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser:true});


const itemsSchema ={
  name: String
};

const listsSchema={
  name: String,
  items: [itemsSchema]
}


const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List",listsSchema);

const item1 = new Item({
  name: "This is Item 1"
});

const item2 = new Item({
  name: "This is Item 2"
});

const defaultItems = [item1,item2];


//const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find({}).then(function(items){
    if(items.length === 0){
      Item.insertMany(defaultItems);
      res.redirect("/");
    }else{
    res.render("list", {listTitle: day, newListItems: items});
    }
  });
  
});


app.get("/:customListName",async function(req,res){
  const listName = _.capitalize(req.params.customListName);

  //console.log(listName);

  if (listName != "Favicon.ico"){

  try{
  const foundList = await List.findOne({name: listName});
      if(!foundList){
      const newList = new List({
        name: listName,
        items: defaultItems
      });
      newList.save();
       res.redirect("/"+listName);
      //console.log("Not Found");
    }
  else{
    //console.log(foundList);
    res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
  }
}catch(err){
  console.log(err);
}
  }
});

app.post("/",async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  const day = date.getDate();
  if(listName === day){
    item.save();
    res.redirect("/");
  }
  else{
    const foundList = await List.findOne({name: listName});
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  }
  
});

app.post("/delete",function(req,res){
  const item = req.body.checkbox;
  const listName = req.body.list;
  //console.log(listName);

  const day = date.getDate();
  if(listName === day){
    Item.findByIdAndRemove(item).then(function(err){
      if(!err) 
      {
      
    }
    });
    res.redirect("/");
  }
  else{
    
    List.findOneAndUpdate({name:listName},{$pull : {items: {_id:item}}}).then(function(err,newList){
      if(!err){
      
      }
      res.redirect("/"+listName);
    });
    
    }

   
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
