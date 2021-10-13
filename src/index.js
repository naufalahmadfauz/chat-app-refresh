const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)
const port = process.env.PORT || 3000
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const publicDirectory = path.join(__dirname, '../public')
const {addUser,removeUser,getUserInRoom,getUser} = require('../src/utils/users')
app.use(express.static(publicDirectory))



io.on('connection',(socket) => {
    console.log('new web socket connection')
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id, username, room})

        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessage(user.username,'Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage',(message,callback)=>{
        const filter = new Filter()
        const userInRoom = getUser(socket.id)
        console.log(userInRoom)
        if (filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(userInRoom.room).emit('message',generateMessage(userInRoom.username,message))
        callback('Delivered')
    })

    socket.on('sendLocation',({latitude,longitude},callback)=>{
        const userInRoom = getUser(socket.id)
        io.to(userInRoom.room).emit('locationMessage',generateLocationMessage(userInRoom.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback('The location has been shared')
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }

    })

})



server.listen(port,()=>{
    console.log('Server is up and running on port',port)
})