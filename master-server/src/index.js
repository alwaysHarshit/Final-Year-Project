import express from 'express';
import cors from 'cors';
import {userRoutes} from "./Routing/userRoutes.js";
import mongoose from "mongoose";

//password-> eNa30YiQKtPaPYbn

const app=express()

app.use(express.json())
app.use(cors({
    origin:"*"
}))


//external client
app.use("/api",userRoutes)


app.get("/",(req,res)=>{
    res.send("hello")
})



mongoose.connect()
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

