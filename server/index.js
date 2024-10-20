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
let groups = []

io.on("connection", (socket) => {
  socket.on("join", (arg) => {
    users[socket.id] = arg
    socket.join("general")
    io.to("general").emit("groups", groups)
    io.to("general").emit("users", users)
  })

  socket.on("disconnect", () => {
    delete users[socket.id]
    io.to("general").emit("users", users)
  })

  socket.on("inviteRoom", (arg) => {
    groups.push(arg.room)
    const idSockets = Object.keys(users).filter((key) =>
      arg.name.includes(users[key])
    )
    io.to("general").emit("groups", groups)
    io.to(idSockets).emit("room", {
      ...arg,
    })
  })

  socket.on("joinRoom", (arg) => {
    socket.join(arg.room, socket.id)
    const socketRooms = io.sockets.adapter.rooms.get(arg.room)
    const a = Array.from(socketRooms)
    const member = Object.keys(users)
      .filter((key) => a.includes(key))
      .map((key) => users[key])
    io.to(arg.room)
      .except(arg.name)
      .emit("roomx", {
        ...arg,
        list: {
          name: arg.name,
          time: new Date(),
          isInfo: true,
          isRead: false,
          isSent: false,
        },
        member: member,
      })
  })

  socket.on("leaveRoom", (arg) => {
    socket.leave(arg.room.id, socket.id)
    io.to(arg.room.id).emit("roomx", {
      room: arg.room.id,
      name: arg.name,
      list: {
        name: arg.name,
        time: new Date(),
        isInfo: true,
        isSent: false,
        isRead: false,
        isLeave: true,
      },
      isLeave: true,
    })
  })

  socket.on("chat", (arg) => {
    if (!arg.isGroup) {
      const to = Object.keys(users).find((key) => users[key] === arg.to)
      io.to(to).emit("chatMessage", arg)
    } else {
      io.to(arg.to).emit("chatMessage", arg)
    }
  })

  socket.on("read", (arg) => {
    if (!arg.isGroup) {
      const to = Object.keys(users).find((key) => users[key] === arg.to)
      io.to(to).emit("readMessage", arg)
    } else {
      const room = Object.values(users).includes(arg.to)
      io.to(room).emit("chatMessage", arg)
    }
  })
})

server.listen(port, hostname, () => {
  console.log(`Listening on http://${hostname}:${port}`)
})
