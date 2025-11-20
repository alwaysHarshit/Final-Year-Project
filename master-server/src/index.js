import express from 'express';
import cors from 'cors';
import {userRoutes} from "./Routing/userRoutes.js";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

//password-> eNa30YiQKtPaPYbn

const app=express()
const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (jobId) => {
        socket.join(jobId);
        console.log(`Client joined job room: ${jobId}`);
    });
});

app.use(express.json())
app.use(cors({
    origin:"*"
}))


//external client
app.use("/api",userRoutes)


app.get("/",(req,res)=>{
    res.send("hello")
})



mongoose.connect("mongodb+srv://new_user_21:eNa30YiQKtPaPYbn@cluster0.atfrl.mongodb.net/?appName=Cluster0")
    .then(() => {
        console.log("✅ connected to database by master server");
        try {
            app.listen(3000,()=>{
                console.log(`server is running on port 3000`)
            });
        } catch (listenErr) {
            console.error("❌ Error during app.listen():", listenErr);
        }
    })
    .catch((err) => {
        console.error("❌ Mongo connection error:", err);
    });

