import express from "express";
import {upload} from "../utils/multer.middleware.js";
import {userController} from "../controller/user.controller.js";
import {dataAnalysis} from "../controller/data.analysis.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello from user routes 👋");
});
router.post("/upload",upload.single('file'),userController)
router.get("/data-analysis",dataAnalysis)

export { router as userRoutes };
