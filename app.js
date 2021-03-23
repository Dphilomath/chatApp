const express = require("express"),
        app = express(),
        mongoose = require("mongoose"),
        server = require("http").createServer(app),
        path = require('path'),
        bodyParser = require("body-parser"),
        io = require('socket.io')(server),
        User  = require("./models/userSchema"),
        Message = require("./models/messageSchema"),
        connect  = require("./dbconnection"),
        port = process.env.PORT||8080;

        connect.then(db  =>  {
        console.log("connected to the database server");
        }).catch(err=>console.log(err))

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({
   extended: false
}));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'/public')))

app.get("/", (req, res)=>{
    res.render("pages/home")
})

app.post("/chat", function(req, res){
    let chatRoom = req.body.chatroom
    var user = req.body.user
    res.render("pages/chatpage", {chatRoom:chatRoom, user:user})
})

io.on('connection', (socket) => {

    console.log(`a user connected`);

    socket.on("welcome", data=>{
        console.log(data)
        socket.emit("welcome", `glad to see you here ${data.user}!!`);
    })

    socket.broadcast.emit('connected',`A new user joined`)

    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('disconnected', 'Someone just left')
    });

    socket.on('chat message', data => {
        let newUser
        let {msg, user} = data

        io.emit('chat message', data);

        let newmsg = new Message(
            {
                _id: new mongoose.Types.ObjectId(),
                message: msg
            })
        let msgID = newmsg._id

        User.findOne({sender: user}, (err, found)=>{

           
            if(err) console.log("ERROR: ",err)

            else if( found!=null) {
                newmsg.sender = found._id
                found.messages.push(msgID)
                found.save((err, saved)=>{
                    if(err) console.log(err)
                    else console.log(saved)
                })
            }

            else {
                newUser = new User({_id: new mongoose.Types.ObjectId(), sender: user})
                newmsg.sender = newUser._id
                newUser.messages.push(msgID)
                newUser.save((err, saved)=>{
                if(err) console.log(err)
                else console.log("saved user: "+ saved)
            })
        }
            newmsg.save((err, savedMsg)=>{
                if(err) console.log(err)
                else console.log(savedMsg)
            })
        })
    });
});


server.listen(port, ()=>{
    console.log("Server listening on port: "+ port);
})