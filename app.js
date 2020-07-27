const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

mongoose.connect("mongodb+srv://admin-somya:somya.123@cluster0.jogpq.mongodb.net/todolistDb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
    name: String
});

const itemsModel = mongoose.model("item", itemsSchema);

const item1 = new itemsModel({
    name: "Welcome to your to-do list!"
});
const item2 = new itemsModel({
    name: "Hit the + button to add new item."
});
const item3 = new itemsModel({
    name: "<-- Hit to delete the item."
});

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const listModel = mongoose.model("List", listSchema);

const defaultItems = [item1, item2, item3];


app.set('view engine', 'ejs');



app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

app.get("/", function (req, res) {
    itemsModel.find({}, function (err, founditems) {
        if (founditems.length === 0) {
            itemsModel.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("successfully inserted items");
                }
            });
            res.redirect("/");
        } else {

            res.render('list', {
                listTitle: "Today",
                newListItems: founditems
            });
        }
    });
});



app.get("/:customListName", function (req, res) {
    const customlistname = _.capitalize(req.params.customListName);
    listModel.findOne({
        name: customlistname
    }, function (err, foundlist) {
       
        if (!err) {
            if (!foundlist) {
                const list1 = new listModel({
                    name: customlistname,
                    items: defaultItems
                });
                list1.save();
                res.redirect("/" + customlistname);
            } else {
                res.render("list", {
                    listTitle: foundlist.name,
                    newListItems: foundlist.items
                });
            }
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const itemName1 = new itemsModel({
        name: itemName
    });
    if (listName === "Today") {
        itemName1.save();
        res.redirect("/");
    } else {
        listModel.findOne({
            name: listName
        }, function (err, foundlist) {
            console.log("foundList", foundlist)
            foundlist.items.push(itemName1);
            foundlist.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const deleteId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today")
    {
        itemsModel.findByIdAndRemove(deleteId, function (err) {
            if (!err) {
                console.log("successfully deleted");
                res.redirect("/");
            }
        });
    }else{
        listModel.findOneAndUpdate({name: listName}, {$pull: {items: {_id:deleteId}}}, function(err, foundlist){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
   
});


app.get("/about", function (req, res) {
    res.render("about");
})

app.listen(3000, function () {
    console.log("hello world");
});