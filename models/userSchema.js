const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;
const Message = require("./messageSchema")
const  userSchema  =  new Schema(
    {
    _id: Schema.Types.ObjectId,
    sender: String,
    messages : [{type: Schema.Types.ObjectId, ref: 'Message'}] }

    ,{ timestamps:true } );

let  User  =  mongoose.model("User", userSchema);
module.exports  =  User;