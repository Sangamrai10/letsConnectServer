const express = require("express")
const http = require("http")
const {Server} = require("socket.io")
const cors = require("cors")

const app = express()
app.use(cors())
const port = process.env.PORT || 3000;
const server = http.createServer(app)

const io= new Server(server,{
  cors:{
    origin:[ "*",
    "https://letsconnect0.netlify.app",
    ],
    methods:["GET", "POST"],
  }
});

io.on("connection",(socket)=>{
  console.log(`connected ${socket.id}`)
  socket.on("send_message", (data)=>{
    socket.broadcast("recieve_message", data)
  })


socket.on("disconnect", ()=>{
  console.log(`disconnected ${socket.id}`)
})
})
server.listen(port,()=>{
  console.log(`server running on ${port}`)
})