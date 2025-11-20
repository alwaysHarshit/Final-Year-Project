import express from 'express';
import cors from 'cors';

import {router} from "./routes/server1.routes.js";
import mongoose from "mongoose";
import {main} from "./utils/Ai.connection.js";

const app=express()

app.use(express.json())

app.use(cors({
    origin:"*"
}))

app.use("/internal",router);


mongoose.connect("mongodb+srv://new_user_21:eNa30YiQKtPaPYbn@cluster0.atfrl.mongodb.net/?appName=Cluster0")
    .then(() => {
        console.log("✅ connected to database");

    })
    .catch((err) => {
        console.error("❌ Mongo connection error:", err);
    });

try {
    app.listen(3001,()=>{
        console.log(`server1 is running on port 3001`);
    });
} catch (listenErr) {
    console.error("❌ Error during app.listen():", listenErr);
}