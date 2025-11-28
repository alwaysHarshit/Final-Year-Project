import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    jobId: String,
    fileName: String,
    metaFile:Object,
    stages: {
        cleaning: Object,
        transforming: Object,
        analysis: Object
    },
    createdAt: Date,
    updatedAt: Date
});

export const JobSchema= mongoose.model("Job", jobSchema);
