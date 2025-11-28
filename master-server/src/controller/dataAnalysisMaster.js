// import axios from "axios";
// import {JobSchema} from "../db/db.model.js";
// import {io} from "../index.js";
//
// //create job in scheduler
// // this pipeline is not fault torrent need to be changed
//
//
// export const dataAnalysisMaster = async (req, res) => {
//     console.log("this is data analysis controller from master server")
//
//     const { jobId } = req.query;
//     const job=await JobSchema.findOne({ jobId: jobId });
//     console.log(job);
//
//     try {
//         const updateStage = async (stage, status, start=null, end=null) => {
//             await JobSchema.findByIdAndUpdate(jobId, {
//                 [`stages.${stage}.status`]: status,
//                 [`stages.${stage}.startedAt`]: start,
//                 [`stages.${stage}.endedAt`]: end,
//                 updatedAt: new Date()
//             });
//         };
//
//         // --- Cleaning Stage ---
//         let start = new Date();
//         sendUpdate(jobId, "Cleaning started...");
//         await updateStage("cleaning", "in-progress", start, null);
//
//         await axios.get("http://localhost:3001/internal/cleaning", {
//             params: { jobId}
//         });
//
//         let end = new Date();
//         await updateStage("cleaning", "done", start, end);
//         sendUpdate(jobId, "Cleaning completed ✔");
//
//         // --- Transformation Stage ---
//         start = new Date();
//         sendUpdate(jobId, "Transformation started...");
//         await updateStage("transforming", "in-progress", start, null);
//
//         await axios.get("http://localhost:3001/internal/transformation", {
//             params: { jobId}
//         });
//
//         end = new Date();
//         await updateStage("transforming", "done", start, end);
//         sendUpdate(jobId, "Transformation completed ✔");
//
//         // --- Analysis Stage ---
//         start = new Date();
//         sendUpdate(jobId, "Analysis started...");
//         await updateStage("analysis", "in-progress", start, null);
//
//         await axios.get("http://localhost:3001/internal/analysis", {
//             params: { jobId}
//         });
//
//         end = new Date();
//         await updateStage("analysis", "done", start, end);
//         sendUpdate(jobId, "Analysis completed ✔");
//
//         // --- Job Completed ---
//         await JobSchema.findByIdAndUpdate(jobId, {
//             jobCompletedAt: new Date()
//         });
//
//         sendUpdate(jobId, "🎉 All stages completed! Insights ready.");
//
//         return res.json({ message: "All stages completed" });
//
//     } catch (error) {
//         console.error("❌ Error in job processing:", error.message);
//         sendUpdate(jobId, "❌ Error occurred during processing");
//
//         await JobSchema.findByIdAndUpdate(jobId, {
//             "stages.cleaning.status": "failed",
//             updatedAt: new Date()
//         });
//     }
// }
//
//
//
// const sendUpdate = (jobId, message) => {
//     io.to(jobId).emit("statusUpdate", message);
// };


import { JobSchema } from "../db/db.model.js";
import { io } from "../index.js";

export const dataAnalysisMaster = async (req, res) => {
    console.log("this is data analysis controller from master server");

    const { jobId } = req.query;

    if (!jobId) {
        return res.status(400).json({ error: "jobId is required" });
    }

    const job = await JobSchema.findOne({ jobId });
    if (!job) {
        return res.status(404).json({ error: "Job not found" });
    }
    console.log(job);

    const sendUpdate = (message) => {
        io.to(jobId).emit("statusUpdate", message);
        console.log(`[WS][${jobId}] ${message}`);
    };

    try {
        const updateStage = async (stage, status, start = null, end = null) => {
            await JobSchema.findOneAndUpdate(
                { jobId },
                {
                    [`stages.${stage}.status`]: status,
                    [`stages.${stage}.startedAt`]: start,
                    [`stages.${stage}.endedAt`]: end,
                    updatedAt: new Date(),
                }
            );
        };

        // Helper to simulate API call with delay
        const mockApiCall = (stageName, delay = 2000) =>
            new Promise((resolve) => {
                setTimeout(() => {
                    sendUpdate(`${stageName} mock API completed ✔`);
                    resolve();
                }, delay);
            });

        // --- Cleaning Stage ---
        let start = new Date();
        sendUpdate("Cleaning started...");
        await updateStage("cleaning", "in-progress", start, null);
        await mockApiCall("Cleaning", 3000); // simulate 3s delay
        let end = new Date();
        await updateStage("cleaning", "done", start, end);

        // --- Transformation Stage ---
        start = new Date();
        sendUpdate("Transformation started...");
        await updateStage("transforming", "in-progress", start, null);
        await mockApiCall("Transformation", 4000); // simulate 4s delay
        end = new Date();
        await updateStage("transforming", "done", start, end);

        // --- Analysis Stage ---
        start = new Date();
        sendUpdate("Analysis started...");
        await updateStage("analysis", "in-progress", start, null);
        await mockApiCall("Analysis", 5000); // simulate 5s delay
        end = new Date();
        await updateStage("analysis", "done", start, end);

        // --- Job Completed ---
        await JobSchema.findOneAndUpdate(
            { jobId },
            { jobCompletedAt: new Date(), updatedAt: new Date() }
        );

        sendUpdate("🎉 All stages completed! Insights ready.");

        return res.status(200).json({ message: "All stages completed" });
    } catch (error) {
        console.error("❌ Error in job processing:", error.message);
        sendUpdate("❌ Error occurred during processing");

        // Mark all stages as failed
        await JobSchema.findOneAndUpdate(
            { jobId },
            {
                "stages.cleaning.status": "failed",
                "stages.transforming.status": "failed",
                "stages.analysis.status": "failed",
                updatedAt: new Date(),
            }
        );

        return res.status(500).json({ error: error.message });
    }
};

