import { JobSchema } from "../db.model.js";
import { exec } from "child_process";
import * as timers from "node:timers";

export const internalDataInsight = async (req, res) => {
    console.log("🔹 Entered internalDataInsight controller");

    const { jobId } = req.query;
    // console.log("Received jobId:", jobId);

    try {
        // Fetch job from DB
        const job = await JobSchema.findOne({ jobId: jobId });
        if (!job) {
            console.warn("⚠️ Job not found in DB for jobId:", jobId);
            return res.status(404).json({ error: "Job not found" });
        }
        // console.log("Job fetched from DB",job);

        // Python script and path
        const pythonPath = `F:\\final year project\\.venv\\Scripts\\python.exe`;
        const scriptPath = `F:\\final year project\\server_1\\src\\pythonScripts\\dataInsight.py`;

        const command = `"${pythonPath}" "${scriptPath}" "${job.fileName}"`;

        // Run Python script
        const runPython = (command) => {
            return new Promise((resolve, reject) => {
                exec(command, { shell: true }, (error, stdout, stderr) => {
                    if (stderr) console.warn("⚠️ Python stderr:\n", stderr);

                    if (error) {
                        console.error("❌ Python exec error:", error);
                        return reject(error);
                    }

                    // Parse JSON output
                    const lines = stdout.split("\n").map(l => l.trim());
                    const jsonLine = lines.find(l => l.startsWith("{"));

                    try {
                        const parsed = JSON.parse(jsonLine);
                        resolve(parsed);
                    } catch (parseErr) {
                        console.error("❌ JSON parsing failed:", parseErr);
                        reject(parseErr);
                    }
                });
            });
        };

        console.log("Calling runPython...");
        const result = await runPython(command);
        console.log("✅ Python script result:", result);

        // Save meta file name to DB
        job.metaFileName = result.output_filename;
        await job.save();
        console.log("✅ Job updated in DB with metaFileName:", job.metaFileName);

        res.status(200).json({
            message: "success",
            metaFileName: result.output_filename,
        });

    } catch (err) {
        console.error("❌ Error in internalDataInsight:", err);
        res.status(500).json({ error: err.message });
    }

    console.log("Exiting internalDataInsight controller");
};
