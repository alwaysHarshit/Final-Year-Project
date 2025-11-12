import axios from "axios";
import {JobSchema} from "../db/db.model.js";
//create job in scheduler

export const dataAnalysis = async (req, res) => {
    const { jobId } = req.query;
    console.log("jobId in data analysis",jobId)

// call cleaning module and Axios automatically rejects the promise (goes to .catch) if the server returns any status outside 2xx (like 400, 404, 500).

    try {
        const start = Date.now();

        await axios.get("http://localhost:3001/internal/cleaning", {
            params: {jobId:jobId},
        });

        const end = Date.now();

        console.log("✅ Data Cleaning result");

        const update = {
            "stages.cleaning.status": "in-progress",
            "stages.cleaning.startedAt": start,
            "stages.cleaning.endedAt": end,
            "updatedAt": new Date()
        };
        // update job in db
        await JobSchema.findByIdAndUpdate(jobId, update, { new: true });

    } catch (error) {
        console.error("❌ Error in cleaning module:", error.message);
        res.status(500).json({ message: "error in cleaning module" });
    }
    res.status(200).json({message:"update successful"})
}
