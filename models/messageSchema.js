const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;
const User = require("./userSchema")

const messageSchema = new Schema({
    _id: Schema.Types.ObjectId, 
    chatroom: String,            //added chatroom in messages
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    message: String},
    {timestamps : true})

const Message = mongoose.model('Message', messageSchema)

module.exports = Message