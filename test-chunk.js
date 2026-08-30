import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function run() {
  const fileId = "test_456";
  const dummyBuffer = Buffer.alloc(1 * 1024 * 1024, 'a');
  
  for (let i = 0; i < 10; i++) {
    const form = new FormData();
    form.append('chunk', dummyBuffer, { filename: 'chunk.part' });
    console.log("Uploading chunk", i);
    const res = await fetch(`http://localhost:3000/api/upload-chunk?fileId=${fileId}&chunkIndex=${i}`, {
      method: 'POST',
      body: form
    });
    console.log("Chunk", i, res.status, await res.text());
  }
}
run().catch(console.error);
