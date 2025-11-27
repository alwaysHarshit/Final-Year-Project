import axios from "axios";
import {JobSchema} from "../db/db.model.js";
import {io} from "../index.js";
import fs from "fs";


//create job in scheduler
// this pipeline is not fault torrent need to be changed


export const dataAnalysis = async (req, res) => {
    const { jobId } = req.query;

    console.log("jobId in data analysis", jobId)

    try {
        const updateStage = async (stage, status, start=null, end=null) => {
            await JobSchema.findByIdAndUpdate(jobId, {
                [`stages.${stage}.status`]: status,
                [`stages.${stage}.startedAt`]: start,
                [`stages.${stage}.endedAt`]: end,
                updatedAt: new Date()
            });
        };

        // --- Getting Insight File ---
        sendUpdate(jobId, "Fetching metafile...");
        const {metaFileName}=await axios.get(
            "http://localhost:3001/internal/insight",
            { params: { jobId } }
        );

        //update in
        sendUpdate(jobId, `Metafile fetched: ${metaFileName}`);

        // --- Cleaning Stage ---
        let start = new Date();
        sendUpdate(jobId, "Cleaning started...");
        await updateStage("cleaning", "in-progress", start, null);

        await axios.get("http://localhost:3001/internal/cleaning", {
            params: { jobId}
        });

        let end = new Date();
        await updateStage("cleaning", "done", start, end);
        sendUpdate(jobId, "Cleaning completed ✔");

        // --- Transformation Stage ---
        start = new Date();
        sendUpdate(jobId, "Transformation started...");
        await updateStage("transforming", "in-progress", start, null);

        await axios.get("http://localhost:3001/internal/transformation", {
            params: { jobId}
        });

        end = new Date();
        await updateStage("transforming", "done", start, end);
        sendUpdate(jobId, "Transformation completed ✔");

        // --- Analysis Stage ---
        start = new Date();
        sendUpdate(jobId, "Analysis started...");
        await updateStage("analysis", "in-progress", start, null);

        await axios.get("http://localhost:3001/internal/analysis", {
            params: { jobId}
        });

        end = new Date();
        await updateStage("analysis", "done", start, end);
        sendUpdate(jobId, "Analysis completed ✔");

        // --- Job Completed ---
        await JobSchema.findByIdAndUpdate(jobId, {
            jobCompletedAt: new Date()
        });

        sendUpdate(jobId, "🎉 All stages completed! Insights ready.");

        return res.json({ message: "All stages completed" });

    } catch (error) {
        console.error("❌ Error in job processing:", error.message);
        sendUpdate(jobId, "❌ Error occurred during processing");

        await JobSchema.findByIdAndUpdate(jobId, {
            "stages.cleaning.status": "failed",
            updatedAt: new Date()
        });
    }
}



const sendUpdate = (jobId, message) => {
    io.to(jobId).emit("statusUpdate", message);
};
