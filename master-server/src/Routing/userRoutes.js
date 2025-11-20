import express from "express";
import {upload} from "../utils/multer.middleware.js";
import {userController} from "../controller/user.controller.js";
import {dataAnalysis} from "../controller/data.analysis.js";
import axios from "axios";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello from user routes 👋");
});
router.post("/upload",upload.single('file'),userController);

router.get("/data-insight", (req, res) => {
    const jobId = req.query.jobId;
    axios.get(`http://localhost:3001/internal/insight`, {params: {jobId: jobId}})
        .then(response=> res.send(response.data))
        .catch(err => res.status(500).send(err))
})


router.get("/data-analysis",dataAnalysis)

export { router as userRoutes };
