//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const _ = require("lodash");




// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://admin-JC:test123@cluster0-n4cyj.mongodb.net/todoListDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const itemsSchema = {
  name: String
};
const Item = mongoose.model("item", itemsSchema);

const shoppingList = new Item({
  name: "Shopping List"
});
const workList = new Item({
  name: "Work List"
});
const choreList = new Item({
  name: "Chore List"
});
const defaultItems = [shoppingList, workList, choreList];


const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {

  Item.find({}, function(err, results) {
    if (err) {
      console.log(err);
    } else {

      if (results.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Default items have been saved to database!");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: results
        });
      }

    }
  });

});
app.post("/", function(req, res) {

  const newListItem = req.body.newItem;
  const listName = req.body.list;

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

  const item = new Item({
    name: newListItem
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      } else {
        console.log(err);
      }
    });
  }

});
app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkBox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item was successfully delete.");
        res.redirect("/");
      }
    });
  } else {
List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, foundList){
  if(!err){
    res.redirect("/" + listName);
  }else{
    console.log(err);
  }
});
  }
});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, results) {
    if (!err) {
      if (!results) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: results.name,
          newListItems: results.items
        });
      }
    } else {
      console.log(err);
    }
  });

});


app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
