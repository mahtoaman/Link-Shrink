const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    urlCode:{
        type: String,
    },
    longUrl:{
        type:String,
    },
    shortUrl: {
        type:String,
    }
},{timestamps:true})

module.exports = mongoose.model("Url",urlSchema);
