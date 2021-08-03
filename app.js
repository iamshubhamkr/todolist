const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");
const date = require(__dirname+"/date.js");//requiring module



const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');//To use EJS

app.use(express.static('public'));//To use JavaScript,CSS,Images

//Creating todolistDB database

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true,useUnifiedTopology: true});
// const items = ["Buy Food","Cook Food","Eat Food",];
//
// const workItems = [];

const items = new mongoose.Schema ({
  name:  {
   type: String,
   required: [true,'Insert some data']
  },
});

const Item = mongoose.model("Item", items);//Creating collection

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items:[items]
};

const List = mongoose.model("List",listSchema);



app.get('/',function(req,res){

  // var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // var currentDay = new Date().getDay();

  // if(currentDay === 6 || currentDay === 0){
  //   day = days[currentDay];
  // }else{
  //   day = "working"
  // }
  // var day = days[currentDay];

  // const day = date.getDate();

  Item.find({},function(err,foundItems){

    if(foundItems.length == 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err) {
          console.log(err);
        } else {
          console.log("Successfully saved defaultItems to database");
        }
      });
      res.redirect('/');
    } else {
      res.render('list',{listTitle : "Today", newListItems : foundItems});
    }


  });


});

app.get('/:customListName',function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){

        // console.log("Doesn't exits")
        const list = new List ({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("Exists");
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items})
      }
    }
  });
});

app.post("/",function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect('/')
  } else {
    List.findOne({name: listName},function(err, foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName)

    });
  }






  // if(req.body.list === "Work List"){//if request comes from /work
  //   workItems.push(item);
  //   res.redirect('/work');
  // }
  // else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post('/delete',function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully Deleted");
        res.redirect('/');
      }

    });
  } else {
    List.findOneAndUpdate({name: listname}, {$pull:{items:{_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }


});



// app.post('/work',function(){
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// })

app.get('/about',function(req,res){
  res.render('about');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
  console.log("Server Started Successfully");
});
