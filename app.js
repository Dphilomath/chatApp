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
        randomstring = require("randomstring"),

        port = process.env.PORT||8080;

        // connect.then(db  =>  {
        // console.log("connected to the database server");
        // }).catch(err=>console.log(err))

//store connected users
var userList = new Map()
var roomKey = new Map()
var rooms = new Map()


app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({
   extended: false
}));

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'/public')))

app.get("/", (req, res)=>{
    let keyvalidity = req.query.v
    res.render("pages/home", {valid: true, keyvalidity : keyvalidity})
})
app.get("/newroom", (req, res)=>{
    let valid = req.query.valid
    res.render("pages/newroom", {valid : valid})
})

app.post("/chat", function(req, res){
    let chatRoom = req.body.chatroom
    var user = req.body.user
    var key = req.body.key
    var valid = false
    for (let v of userList.values()) {
        if(v==user) {
            valid = false
            return res.render("pages/home", {valid: valid});
        }
    }
    if(key){
        if(chatRoom == roomKey.get(key)){
            rooms.get(chatRoom).add(user)
            res.render("pages/chatpage", {user, chatRoom, key})
        }else res.redirect("/?v=false")
    } else{
        if(rooms.has(chatRoom))   return res.redirect("/newroom?valid=false");
        key =  randomstring.generate({
            length: 5,
            charset: "alphanumeric",
            capitalization:"lowercase"
        });
        while(roomKey.has(key)==true){
            key =  randomstring.generate({
                length: 5,
                charset: "alphanumeric",
                capitalization:"lowercase"
            });
        }
        rooms.set(chatRoom, new Set().add(user))
        roomKey.set(key, chatRoom)
        res.render("pages/chatpage", {user, chatRoom, key})
    }
})



io.on('connection', (socket) => {
    var chatroom="";
    console.log(`a user connected`);

    console.log(rooms.values())
    //on connection
    socket.on("welcome", data=>{
        chatroom = data.chatroom
        console.log(data)
        socket.join(chatroom)
        io.in(chatroom).emit("welcome", `glad to see you here ${data.user}!!`);
        userList.set(socket.id, data.user)
    })
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on("disconnecting", ()=>{
        let leavingUser = userList.get(socket.id)
        let leavingRoom
        // console.log(socket.rooms)
        socket.rooms.forEach(element => {
            leavingRoom = element
        });
        rooms.get(leavingRoom).delete(leavingUser)
        socket.to(leavingRoom).emit("disconnected", `${leavingUser} just left`)
        userList.delete(socket.id)

        if(rooms.get(leavingRoom).size==0){
            rooms.delete(leavingRoom)
        }
    })

    socket.on('chat message', data => {
        let newUser
        let {msg, user, room} = data

        // io.emit('chat message', data);

        io.sockets.in(room).emit('chat message', data);

        // save message to database DO NOT DELETE
        // let newmsg = new Message(
        //     {
        //         _id: new mongoose.Types.ObjectId(),
        //         message: msg,
        //         chatroom: room
        //     })
 
        // let msgID = newmsg._id

        // User.findOne({sender: user}, (err, found)=>{

           
        //     if(err) console.log("ERROR: ",err)

        //     else if( found!=null) {
        //         newmsg.sender = found._id
        //         found.messages.push(msgID)
        //         found.save((err, saved)=>{
        //             if(err) console.log(err)
        //             // else console.log(saved)
        //         })
        //     }

        //     else {
        //         newUser = new User({_id: new mongoose.Types.ObjectId(), sender: user})
        //         newmsg.sender = newUser._id
        //         newUser.messages.push(msgID)
        //         newUser.save((err, saved)=>{
        //         if(err) console.log(err)
        //         // else console.log("saved user: "+ saved)
        //     })
        // }
        //     newmsg.save((err, savedMsg)=>{
        //         if(err) console.log(err)
        //         // else console.log(savedMsg)
        //     })
        // })
    });
});



server.listen(port, ()=>{
    console.log("Server listening on port: "+ port);
})