import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import {router} from "./routes/server1.routes.js";
import mongoose from "mongoose";

const app=express()

app.use(express.json())

app.use(cors({
    origin:"*"
}))

app.use("/internal",router);


mongoose.connect()
    .then(() => {
        console.log("✅ connected to database");

    })
    .catch((err) => {
        console.error("❌ Mongo connection error:", err);
    });

try {
    app.listen(3001,()=>{
        console.log(`server1 is running on port 3001`)
    });
} catch (listenErr) {
    console.error("❌ Error during app.listen():", listenErr);
}