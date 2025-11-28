import { JobSchema } from "../db.model.js";
import { exec } from "child_process";
import { ai } from "../utils/Ai.connection.js";

export const internalDataInsight = async (req, res) => {
    console.log("🔹 Entered internalDataInsight controller");

    const { jobId } = req.query;

    try {
        const job = await JobSchema.findOne({ jobId });
        if (!job) return res.status(404).json({ error: "Job not found" });

        const pythonPath = `F:\\final year project\\.venv\\Scripts\\python.exe`;
        const scriptPath = `F:\\final year project\\server_1\\src\\pythonScripts\\dataInsight.py`;
        const datasetPath = `../../shared/dataset/${job.fileName}`;
        const command = `"${pythonPath}" "${scriptPath}" "${job.fileName}"`;

        const result = await runPython(command);

        // --- Save metadata ---
        job.metaFile = result.output;
        await job.save();

        console.log("📁 Metadata saved.");

        // --- Call AI to generate EDA code ---
        const generatedEDA = await generateEDA(result.output, job.fileName);
        console.log("🤖 EDA generated.");

        // clean the generated eda code
        const cleanedScript = cleanPythonScript(generatedEDA);

        const generatedEDAScriptsPath =await savePythonScript(cleanedScript,jobId);

        const  command2 = `"${pythonPath}" "${generatedEDAScriptsPath}" "${datasetPath}"`;
        // Run Python script
        runPython(command2)
            .then(() => {
                console.log("✅ Python EDA script executed successfully");

                // Absolute path to the generated HTML report
                const reportPath = path.resolve("../../shared/metaFiles/report.html");

                // Check if file exists
                if (!fs.existsSync(reportPath)) {
                    return res.status(404).json({ error: "EDA report not found" });
                }

                // Send the HTML file to the frontend
                res.status(200).sendFile(reportPath);
            })
            .catch(err => {
                console.error("❌ Error running Python script:", err);
                res.status(500).json({ error: "Failed to generate EDA report" });
            });

    } catch (err) {
        console.error("❌ Error:", err);
        return res.status(500).json({ error: err.message });
    }
};


/************* HELPERS *************************/


import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const savePythonScript = async (scriptText, jobId) => {
    const dirPath = path.join(__dirname, "../files/generated_scripts");
    const filePath = path.join(dirPath, `eda_${jobId}.py`);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, scriptText);
    return filePath;
};




const runPython = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, { shell: true }, (error, stdout, stderr) => {
            if (stderr) console.warn("⚠️ Python stderr:\n", stderr);

            if (error) return reject(error);

            try {
                const start = stdout.indexOf("###START_JSON###") + "###START_JSON###".length;
                const end = stdout.indexOf("###END_JSON###");

                if (start === -1 || end === -1) throw new Error("JSON markers not found");

                const jsonText = stdout.slice(start, end).trim();
                resolve(JSON.parse(jsonText));

            } catch (err) {
                reject(err);
            }
        });
    });
};


// ——— AI function ———
const generateEDA = async (metadata, fileName) => {
    console.log("🤖 Calling Gemini for EDA...");
    //console.log(JSON.stringify(metadata, null, 2))
    const prompt = `
You are a Python data analyst.

Here is metadata of a dataset:
${JSON.stringify(metadata, null, 2)}

The dataset file name is: ${fileName}
The dataset file path to load is: ../../shared/dataset/${fileName}

Generate a complete Python script that:

- Loads the dataset using pandas
- Performs cleaning and missing value handling
- Generates summary statistics
- Detects outliers
- Generates an automated HTML EDA report using ydata-profiling
- Saves the HTML report in the folder "../../shared/metaFiles"
- The output HTML file name must be: report.html

At the very end of the script, **print a JSON object containing the path to the generated HTML report** wrapped in the following markers for Node.js parsing:

###START_JSON###
<json object with report_path key>
###END_JSON###

Example of what the printed JSON should look like:

###START_JSON###
{"report_path": "../../shared/metaFiles/"}
###END_JSON###

Important Rules:
- Use modern import: "from ydata_profiling import ProfileReport"
- Do NOT print explanations, comments, or markdown
- Return ONLY the runnable Python code
`;



    const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.text ?? "⚠ No response generated";

};
const cleanPythonScript = (script) => {
    return script
        .replace(/```python/g, "")
        .replace(/```/g, "")
        .trim();
};