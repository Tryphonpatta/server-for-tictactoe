const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {Server} = require("socket.io");
const users = {};

app.use(cors());

const server = http.createServer(app);

const io = new Server(server,{
    cors: {
        origin: "*",
        methods: ["GET","POST"],
    },
})

io.on("connection",(socket)=>{
    console.log(`User Connected : ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`User Disconnect : ${socket.id}`);
        for (let room in users){
            if (users[room].includes(socket.id)){
                users[room] = users[room].filter((user) => user!== socket.id);
                io.to(room).emit('users',users[room]);
            }
        }
    })
    socket.on("connectRoom",(room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room ${room}`);
        if (!users[room]) {
            users[room] = [];
        }
        if(!users[room].includes(socket.id))users[room].push(socket.id);
        io.to(room).emit('users', users[room]);
    })
    socket.on('turns',(data) => {
        console.log(`this is ${data.turn}`)
        io.to(data.room).emit('turns',data.turn);
    })
    socket.on('boards',(data)=>{
        io.to(data.room).emit('boards',data.board);
    })
    
});

server.listen(3000,() =>{
    console.log("SERVER RUNNING");

});