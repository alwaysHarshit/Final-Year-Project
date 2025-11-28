import express from "express";
import {upload} from "../utils/multer.middleware.js";
import {userController} from "../controller/user.controller.js";
import {dataAnalysisMaster} from "../controller/dataAnalysisMaster.js";
import axios from "axios";
import {dataInsightMaster} from "../controller/data.insight.master.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello from user routes 👋");
});
router.post("/upload",upload.single('file'),userController);

router.get("/data-insight",dataInsightMaster)

router.get("/data-analysis",dataAnalysisMaster)


export { router as userRoutes };
