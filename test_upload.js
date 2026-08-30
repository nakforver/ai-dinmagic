import fs from 'fs';
async function test() {
    try {
        const formData = new FormData();
        const blob = new Blob(["test chunk content"]);
        formData.append("chunk", blob, "chunk.part");
        
        const res = await fetch("http://localhost:3000/api/upload-chunk?fileId=123&chunkIndex=0", {
            method: "POST",
            body: formData
        });
        console.log("Status:", res.status);
        console.log("Text:", await res.text());
    } catch(e) {
        console.error("Fetch failed:", e);
    }
}
test();
