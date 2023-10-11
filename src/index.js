const express =  require("express");
const path =  require("path")
const http = require('http')
const app =  express()
const server = http.createServer(app)
const socketIo =  require("socket.io");
const { genereateMsg, generateLocationMessage } = require("./utils/messages");
const { addUser, getUser, getUsersInRoom, removeUser } = require("./utils/users");
const io = socketIo(server)


const port = process.env.PORT 

const publicDirectoryPath = path.join(__dirname,"../public");
app.use(express.static(publicDirectoryPath))

 

io.on('connection' ,(socket) => {
    
    console.log('A user connected');


    socket.on("join", (options,callback) => {

        const {user, error} = addUser({id:socket.id,...options})

        console.log("user : " + user.username + ' || error : ' + error)

        if(error){
            return callback(error)
        }


        socket.join(user.room)
        socket.emit("message",genereateMsg("Welcome !","Admin"))
        socket.broadcast.to(user.room).emit("message",genereateMsg(
            `${user.username} has joined!`
        ))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })


       return callback(null)
    
    })


  

    socket.on("sendMessage",(msg,callback)=> {

        const user = getUser(socket.id)
        if(user){
            io.to(user.room).emit("message",genereateMsg(msg,user.username))
            callback("successful delivrey !!!! ")
        }


   })
   
   socket.on("sendLocation",({longitude,latitude} ,callback)=> {

    const user = getUser(socket.id)


    io.emit("locationMessage" ,generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`,user.username))
        callback("successful delivrey !!!! ")
    })

   socket.on('disconnect',() => {

    const user = removeUser(socket.id)

    if(user){
        io.to(user.room).emit("message",genereateMsg(`${user.username} has left !`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
    }

   })


})




server.listen( port,() => {
    console.log("the server is up on port " + port);
})
