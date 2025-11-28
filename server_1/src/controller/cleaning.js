import {exec} from "child_process";
import {JobSchema} from "../db.model.js";


export const analysisInternal = async (req, res) =>{

    const id = req.query.jobId;

    //get job from db
    const job= await JobSchema.findOne({jobId:id});

    // call ai model to get cleaning script
    // const fileResponseAI=await uploadJsonFileAi(`../../shared/metaFiles/${job.metaFileName}`)
    // const result=await requestAi(fileResponseAI);

    //need to change the path of python and script
    const pythonPath = `"F:\\final year project\\.venv\\Scripts\\python.exe"`;
    const scriptPath = `"F:\\final year project\\server_1\\src\\pythonScripts\\cleaning.py"`;

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
        res.send({ message: "Python script executed successfully", output: stdout });
    });

}