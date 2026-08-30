import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function test() {
    const ai = new GoogleGenAI();
    try {
        console.log("Uploading blob...");
        const buffer = fs.readFileSync("/tmp/audio_1787895859669.mp3");
        const blob = new Blob([buffer]);
        const res = await ai.files.upload({ file: blob, config: { mimeType: "audio/mpeg" } });
        console.log("Upload result:", res.name);
    } catch(e) {
        console.error("Upload failed:", e);
    }
}
test();
