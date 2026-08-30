import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
const ai = new GoogleGenAI({});
fs.writeFileSync('test.txt', 'Hello world');
try {
  console.log("Uploading with config...");
  const res1 = await ai.files.upload({ file: 'test.txt', config: { mimeType: 'text/plain' } });
  console.log("Success 1", res1.name);
} catch (e) {
  console.error("Error 1", e.message);
}
try {
  console.log("Uploading with direct mimeType...");
  const res2 = await ai.files.upload({ file: 'test.txt', mimeType: 'text/plain' });
  console.log("Success 2", res2.name);
} catch (e) {
  console.error("Error 2", e.message);
}
