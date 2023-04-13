const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Nandhini:Nandhini123@cluster0.hfnsqjr.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your todolist!"
});

const item2 = new Item ({
    name: "Hit the + button to add a new item."
});

const item3 = new Item ({
    name: "--> Hit this to delete an item."
});

const defaultItems = [item1, item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};
 
const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

    Item.find() .then(function(items) {
      
        if(items.length === 0) {
            Item.insertMany(defaultItems) .then(function() {
                console.log("Successfully saved default items to DB.");
            }) .catch(function(err) {
                console.log(err);
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: items});
        }  
    });
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}) .then(function(foundList) {
            if(!foundList) {
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            
            } else {
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
            }
        });  
});



app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item ({
        name: itemName
    });
    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}) .then(function(foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
});

app.post("/delete", function(req, res) {

   const checkedItemID = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemID) .then(function() {
        console.log("Successfully Deleted!");
        res.redirect("/");
       }).catch(function(err) {
        console.log(err);
       });
   } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}) .then(function(foundList) {
            res.redirect("/" + listName);
        }).catch(function(err) {
            console.log(err);
        });
   }
   
});

app.get("/about", function(req,res) {
    res.render("about");
});


    let port = process.env.PORT;
    if(port === null || port === "") {
        port = 3000;
    }
    app.listen(port, function() {
    console.log("Server has started successfully.");
});
