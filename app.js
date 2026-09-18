// app.js

const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const cors = require('cors');
const port = 8888;


app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: 'abc',
    resave: false,
    saveUninitialized: true,
}));
app.use(cors());
app.use(flash());
app.set("view-engine", "ejs");
app.listen(port, (err)=>{
    if(err){
        console.log(err.message);
        return;
    }
    else{
        console.log("Running at " + port);
    }
});

app.use("/", require("./routes/mainRoute"));