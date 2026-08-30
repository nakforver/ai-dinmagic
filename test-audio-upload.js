import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);
const ai = new GoogleGenAI({});

async function run() {
  console.log("Creating silent audio...");
  await execAsync(`ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 3 -q:a 9 -acodec libmp3lame test.mp3 -y`);
  
  console.log("Uploading audio...");
  const res = await ai.files.upload({ file: 'test.mp3', config: { mimeType: 'audio/mpeg' } });
  console.log("Success", res.name);
  await ai.files.delete({ name: res.name });
}
run().catch(console.error);
