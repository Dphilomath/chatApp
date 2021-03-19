require('dotenv').config()
const  mongoose  = require("mongoose");
mongoose.Promise  = require("bluebird");
const  url  =  `mongodb+srv://${process.env.user}:${process.env.PASS}@data.fee59.mongodb.net/chatApp?retryWrites=true&w=majority`;
const  connect  =  mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology:true });
module.exports  =  connect;
