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

// app.get('/', function(req, res) {
//   res.end('ok');
// });

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`)

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`)
  })
  socket.join("general")

  // socket.on("audio", (arg) => {
  //   socket.emit("broadcast", arg)
  // })

  socket.on("chat", (arg) => {
    io.to("general").emit("chat", arg)
    // socket.emit("chat", arg)
  })
})

server.listen(port, hostname, () => {
  console.log(`Listening on http://${hostname}:${port}`)
})
