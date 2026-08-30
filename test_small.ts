import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function test() {
    const ai = new GoogleGenAI();
    try {
        console.log("Uploading small file...");
        const res = await ai.files.upload({ file: "/tmp/small.mp3", config: { mimeType: "audio/mpeg" } });
        console.log("Upload result:", res.name);
    } catch(e) {
        console.error("Upload failed:", e);
    }
}
test();
