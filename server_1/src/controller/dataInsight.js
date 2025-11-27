import {JobSchema} from "../db.model.js";
import {exec} from "child_process";

export const dataInsight = async (req, res) => {
    const {jobId} = req.query;
    console.log("jobId in data insight",jobId);

    // get job from db and locate dataset file path and meta file path
    const job= await JobSchema.findOne({jobId:jobId});
    console.log("job fetched from db",job)



    //need to change the path of python and script
    const pythonPath = `F:\\final year project\\.venv\\Scripts\\python.exe`;
    const scriptPath = `F:\\final year project\\server_1\\src\\pythonScripts\\dataInsight.py`;

    console.log("🟡 Running Python script...");

    const command = `"${pythonPath}" "${scriptPath}" "${job.fileName}"`;

    //this function runs python script and returns a promise
    const runPython = (command) => {
        return new Promise((resolve, reject) => {
            exec(command, { shell: true }, (error, stdout) => {
                if (error) return reject(error);

                const jsonLine = stdout.split("\n").find(line => line.trim().startsWith("{"));
                resolve(JSON.parse(jsonLine));
            });
        });
    };

    try {
        const result = await runPython(command);

        job.metaFileName = result.output_filename;
        await job.save();

        res.status(201).json({
            message: "success",
            metaFileName: result.output_filename
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};