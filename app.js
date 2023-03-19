//jshint esversion:6

const express=require("express");
const bodyParser=require("body-parser");
// const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");

    mongoose.connect("mongodb://0.0.0.0:27017/todolistDB");
    const itemsSchema = new mongoose.Schema({
        name:String
    });




// console.log(date.getDate());
const app=express();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))





const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
    name:"Welcome to your todolist!"
});

const item2=new Item({
    name:"Hit the + button to aff a new item."
});

const item3=new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];
// Item.insertMany(defaultItems);

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function(req,res){
    // let day=date.getDate();
    function getItems(){
        const Items = Item.find({});
        return Items;
      };

      getItems().then(function(FoundItems){
        if (FoundItems.length==0){
            Item.insertMany(defaultItems);
            res.redirect("/");
        }
        res.render("list",{listTitle:"Today",newListItems:FoundItems});
      });
    
});

app.post("/",function(req,res){
    const itemName=req.body.newItem
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    });

    if(listName=="Today"){
        item.save();
        res.redirect("/");
    }else{
        async function run(){
            const result=await List.findOne({name:listName});
            result.items.push(item);
            result.save();
            res.redirect("/"+listName);
        }
        run();
    }
    
    // if(req.body.list==="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");   
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox
    const listName=req.body.listName;

    if(listName=="Today"){
        async function run(){
            await Item.deleteOne({_id:checkedItemId});
        }    
        run();
        res.redirect("/");
    }else{
        async function run(){
            // await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
            // const s1=await ;
            // const s2=await ;
            const result=await List.findOne({name:listName});
            // console.log(result.items);
            const arr=[];
            for (var i=3;i<result.items.length;i++){
                if(result.items[i]._id!=checkedItemId){
                    arr.push(result.items[i]);
                }
            }
            // console.log(arr);
            for(var i=1;i<=result.items.length-3;i++){
                result.items.pop();
            }

            for(var i=0;i<arr.length;i++){
                result.items.push(arr[i]);
            }
            // for(var i=0;i<result.items.length;i++){
            //     console.log(result.items[i]);
            // }
            result.save();
        }
        run();
        res.redirect("/"+listName);
    }

    
});

// app.get("/work",function(req,res){
//     // console.log(req.body.list);
//     res.render("list",{listTitle:"Work List",newListItems:workItems});
// });

app.get("/:customListName",function(req,res){
    const customListName=req.params.customListName;
    async function r(){
        const result=await List.findOne({name:customListName});

        // if(!result)
        // {
            // Create a new list
            
            // list.save();
            // console.log(result);
            // console.log(result.name);
            // console.log(result.items[0].name);
        // }else{
        //     //Show an existing list
        //     res.render("list",{listTitle:result.name,newListItems:result.items});
        // }
        if(result==null){
            //create a new list
            const list=new List({
                name:customListName,
                items:defaultItems
            });
            list.save();
            // res.render("list",{listTitle:customListName,newListItems:list.items});
            res.redirect("/"+customListName);
        }else{
            res.render("list",{listTitle:customListName,newListItems:result.items});
        }
    }

    r();
    
});

app.get("/about",function(req,res){
    res.render("about");
});

// app.post("/work",function(req,res){
//     let item=req.body.newItem;
//     workItems.push(item);
//     res.render("/work");
// });



app.listen(3000,function(){
    console.log("Server started on port 3000");
});





