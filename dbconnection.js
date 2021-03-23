require('dotenv').config()
const  mongoose  = require("mongoose");
mongoose.Promise  = require("bluebird");
let url
if (process.env.NODE_ENV==="production")  url  =  `mongodb+srv://${process.env.user}:${process.env.PASS}@data.fee59.mongodb.net/chatApp?retryWrites=true&w=majority`;
else url = "mongodb://localhost:27017/chatApp"
const  connect  =  mongoose.connect(url, { useNewUrlParser: true , useUnifiedTopology:true });
module.exports  =  connect;
