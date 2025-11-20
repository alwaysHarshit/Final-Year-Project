import {JobSchema} from "../db.model.js";
import {exec} from "child_process";

export const dataInsight = async (req, res) => {
    const {jobId,metaFileName} = req.query;
    console.log("jobId in data insight",jobId);

    // get job from db and locate dataset file path and meta file path
    const job= await JobSchema.findOne({jobId:jobId});
    console.log("job fetched from db",job)

    console.log("meta file name in data insight",metaFileName)
    // reading file from stoage and sending to ai model.



    //need to change the path of python and script
    const pythonPath = `"F:\\final year project\\.venv\\Scripts\\python.exe"`;
    const scriptPath = `"F:\\final year project\\server_1\\src\\pythonScripts\\dataInsight.py"`;


    console.log("🟡 Running Python script...");
    console.log(`Command: ${pythonPath} ${scriptPath}`);

    exec(`${pythonPath} ${scriptPath} ${job.fileName}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error: ${error.message}`);
            return res.status(500).send({ error: error.message });
        }
        if (stderr) {
            console.error(`⚠️ Stderr: ${stderr}`);
        }

        console.log(`✅ Output: ${stdout}`);
        res.status(200).json({ message: "Python script executed successfully", metaFileName: stdout });
    });
};