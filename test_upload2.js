import fs from 'fs';

async function test() {
    try {
        const fileId = "test_4_chunks";
        for (let i = 0; i < 4; i++) {
            const formData = new FormData();
            // 512KB chunk
            const blob = new Blob([new Uint8Array(512 * 1024).fill(0)]);
            formData.append("chunk", blob, "chunk.part");
            
            console.log(`Uploading chunk ${i}...`);
            const res = await fetch(`http://localhost:3000/api/upload-chunk?fileId=${fileId}&chunkIndex=${i}`, {
                method: "POST",
                body: formData
            });
            console.log(`Chunk ${i} Status:`, res.status);
            console.log(`Chunk ${i} Text:`, await res.text());
        }
    } catch(e) {
        console.error("Fetch failed:", e);
    }
}
test();
