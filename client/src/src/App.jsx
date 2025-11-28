import './App.css'

import React, { useState } from "react";
import axios from "axios";

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage("Please select a CSV file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:3000/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage(`✅ ${res.data.message || "File uploaded successfully!"}`);
            console.log(res.data);
        } catch (error) {
            console.error(error);
            setMessage("❌ Upload failed. Please try again.");
        }
    };

    return (
        <div style={styles.container}>
            <h2>Upload CSV File</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>

            <button onClick={()=>{
                axios.get("http://localhost:3000/api/data-insight",{params:{jobId:"1764327571411"}})
                    .then(res=>{
                        console.log(res.data)
                    })
                    .catch(err=>{
                            console.log(err)
                        }
                    )
            }}>push me for insights</button>
            {message && <p>{message}</p>}
        </div>
    );
}

const styles = {
    container: {
        marginTop: "50px",
        textAlign: "center",
    },
    form: {
        marginTop: "20px",
    },
};
