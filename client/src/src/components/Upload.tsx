import { ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Tiles from "./tiles";


//for loading
type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

const [jobIds, setJobIds] = useState<string[]>([]);

// Load jobIds from MongoDB on page load -> to persist data even on reloading the page
// useEffect(() => {
//   axios.get("http://localhost:3000/api/jobids")
//     .then(res => {
//       setJobIds(res.data.jobIds);
//     })
//     .catch(err => console.log("Error loading jobIds", err));
// }, []);


  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  async function handleFileUpload() {
    if (!file) return;

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      let res = await axios.post("http://localhost:3000/api/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });
      console.log(res.data)
      setStatus("success");
      setUploadProgress(100);
      
      const newJobId = res.data.jobId;

      setJobIds(prev => [...prev, newJobId]);   // ⬅ add new jobId to list

    } catch {
      setStatus("error");
      setUploadProgress(0);
    }
  }

  

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-black via-gray-900 to-blue-900 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 rounded-3xl backdrop-blur-xl bg-white/10 shadow-2xl border border-white/20 text-white space-y-6"
      >
        <h1 className="text-3xl font-bold text-center text-blue-300 tracking-wide">Upload CSV File</h1>

        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-blue-400 rounded-2xl cursor-pointer hover:bg-blue-400/10 transition">
          <span className="text-lg text-blue-300">Click to select CSV file</span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>

        {file && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-white/10 rounded-xl border border-white/20 text-sm"
          >
            <p><strong>Name:</strong> {file.name}</p>
            <p><strong>Size:</strong> {(file.size / 1024).toFixed(2)} KB</p>
            <p><strong>Type:</strong> {file.type}</p>
          </motion.div>
        )}

        {status === "uploading" && (
          <div className="space-y-3">
            <div className="w-full h-3 rounded-full bg-gray-600 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ ease: "easeInOut", duration: 0.2 }}
                className="h-full bg-blue-500 rounded-full"
              ></motion.div>
            </div>
            <p className="text-center text-blue-300">{uploadProgress}% uploaded...</p>
          </div>
        )}

        {file && status !== "uploading" && (
          <button
            onClick={handleFileUpload}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold text-lg shadow-lg"
          >
            Upload
          </button>
        )}

        {status === "success" && (
          <p className="text-center text-green-400 font-semibold text-lg">Upload Successful! 🎉</p>
        )}

        {status === "error" && (
          <p className="text-center text-red-400 font-semibold text-lg">Upload Failed! Try Again. ❌</p>
        )}
      </motion.div>

      <Tiles jobIds={jobIds} />
    </div>
  );
}
