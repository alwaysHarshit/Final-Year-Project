
import axios from "axios";


export const dataInsightMaster = async (req, res)=> {
    console.log("this is data insight controller from master server")
    const {jobId} = req.query;

    //call internal server
    const result = await axios.get(`http://localhost:3001/internal/insight`, {params: {jobId: jobId},responseType:'stream'})
    //console.log("this is result from internal server",result.data)

    if(result.status !== 200) return res.status(500).json({error: "error in getting insight from internal server"})
    result.data.pipe(res);

}