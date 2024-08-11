import express from "express"
import http from "http"
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
})
const hostname = "127.0.0.1"
const port = 3000

let users = {}

io.on("connection", (socket) => {
  socket.on("join", (arg) => {
    users[socket.id] = arg
    socket.join("general")
    io.to("general").emit("users", users)
  })

  socket.on("disconnect", () => {
    delete users[socket.id]
    io.to("general").emit("users", users)
  })

  // socket.on("joinRoom", (arg) => {
  //   // console.log("joinRoom", socket.id, arg)
  //   socket.join(arg.room)
  //   io.to(arg.room).emit("roomx", `joined ${arg.name} in ${arg.room}`)
  //   console.log(socket.rooms)
  // })

  // socket.on("leaveRoom", (arg) => {
  //   // console.log("leaveRoom", arg)
  //   socket.leave(arg.room)
  //   io.to(arg.room).emit("roomx", `${arg.name} has left the room ${arg.room}`)
  //   //  const a = {
  //   //    id: socket.id,
  //   //    name: arg,
  //   //  }
  //   //  users.push(a)
  //   //  socket.join("1")
  //   //  io.to("general").emit("room", users)
  // })

  socket.on("chat", (arg) => {
    if (!arg.isGroup) {
      const to = Object.keys(users).find((key) => users[key] === arg.to)
      io.to(to).emit("chatMessage", arg)
    } else {
      const room = Object.values(users).includes(arg.to)
      io.to(room).emit("chatMessage", arg)
    }
  })
})

server.listen(port, hostname, () => {
  console.log(`Listening on http://${hostname}:${port}`)
})
