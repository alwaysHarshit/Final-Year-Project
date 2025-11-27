import fs from 'fs';
import axios from "axios";


export const dataInsightMaster = async (req, res)=> {
    console.log("this is data insight controller from master server")
    const {jobId} = req.query;

    //call internal server
    const result = await axios.get(`http://localhost:3001/internal/insight`, {params: {jobId: jobId}})
    console.log("this is result from internal server",result.data)

    fs.readFile(`../../shared/metaFiles/${result.data.metaFileName}`, "utf8", (err, data) => {
        if (err) {
            res.status(500).json({error: err.message})
        }
        res.status(200).json(data)

    });
}