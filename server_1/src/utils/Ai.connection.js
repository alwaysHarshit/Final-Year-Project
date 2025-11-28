import { } from '@google/generative-ai';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {GoogleAIFileManager} from "@google/generative-ai/server";

const GEMINI_API_KEY="AIzaSyBzUAuTbcizJKRM125Z0HWu4SwTuRpN-qE";
const ai = genkit({
    plugins: [googleAI({ apiKey: GEMINI_API_KEY })],

});
const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

export async function uploadJsonFileAi(filePath) {
    const response = await fileManager.uploadFile(filePath, {
        mimeType: 'application/json'
    });
    console.log("file uploaded to ai",response);
    return response.file;
}

export async function requestAi(file) {
    const response = await ai.generate({
        model: googleAI.model('gemini-2.5-flash'),
        prompt: [
            { text: 'Analyze this JSON metadata file and generate the Python cleaning script based on its contents:' },
            {
                media: {
                    // Use the correct mimeType and URI from your upload result
                    contentType: file.mimeType,
                    url:file.uri,
                },
            },
        ],
    });
    return response.text;
}


