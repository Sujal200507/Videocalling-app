import express from "express"
import { createServer } from 'node:http';
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const app = express();
const server = createServer(app);
const io = new Server(server);
const allusers = {};

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static("public"))

app.get("/",(req,res)=>{
   //res.send("hello")
   console.log("get request working");
   res.sendFile(join(__dirname +'/app/index.html'));
   
})

//handle io connection
io.on("connection",(socket)=>{
    console.log(`someone connected to socket and socket id is ${socket.id}`);
    socket.on("join-user",username=>{
        console.log(`${username} joined socket connection`);
        allusers[username] = {username,id: socket.id}

        //inform everyone that someone join
        io.emit("joined",allusers)
    })
    socket.on("offer",({from,to,offer})=>{
           console.log({from,to,offer});
           io.to(allusers[to].id).emit("offer",{from,to,offer})
    })
    socket.on("answer",({from,to,answer})=>{
        io.to(allusers[from].id).emit("answer",{from,to,answer})
    })

    socket.on("end-call", ({from, to}) => {
        io.to(allusers[to].id).emit("end-call", {from, to});
    });

    socket.on("call-ended", caller => {
        const [from, to] = caller;
        io.to(allusers[from].id).emit("call-ended", caller);
        io.to(allusers[to].id).emit("call-ended", caller);
    })

    socket.on("icecandidate",candidate=>{
        console.log({candidate});
        socket.broadcast.emit("icecandidate", candidate);
    })
})

//exposing public




server.listen(9000,()=>{
    console.log("working");
    
})











