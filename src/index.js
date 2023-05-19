const express = require('express');
const mongoose = require('mongoose');
const route = require('../src/routes/route');
const cors = require('cors')
const app = express();


app.use(express.json());
app.use(cors())

const url = "mongodb+srv://amanmahto:anuragf45@amanscluster.os0m9fw.mongodb.net/group58Database?retryWrites=true&w=majority";

const port = process.env.PORT || 8000;

mongoose.connect(url, {useNewUrlParser:true})
.then(()=>console.log("MongoDB is connected"))
.catch(err => console.log(err));

app.use('/', route);

app.listen(port, ()=>{
    console.log("Express app is running on port " +port);
})

