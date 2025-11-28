// controller that control and validate the csv data

import {JobSchema} from "../db/db.model.js";

export const userController=async (req, res) => {
    
    const {file}=req;
    console.log("file received in master server");

    // add job to db
    try {
        const jobId = Date.now().toString();
        const data=await JobSchema.create({
            jobId,
            fileName: file.filename,
            stages: {
                cleaning: { status: "pending", startedAt: null, endedAt: null },
                transforming: { status: "pending", startedAt: null, endedAt: null },
                analysis: { status: "pending", startedAt: null, endedAt: null },
            },
            createdAt: new Date(),
        });

        console.log("job saved to db",data);
        res.status(200).json({ jobId, message: "file uploaded successfully" });
    } catch (err) {
        console.error("error in saving job to db", err);
        res.status(500).json({ message: "error in saving job to db" });
    }
}