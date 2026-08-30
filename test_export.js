import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function run() {
  const form = new FormData();
  
  // create dummy video and srt
  const dummyVideo = Buffer.alloc(10 * 1024, 'v'); 
  // actually ffmpeg will fail on dummy video, but we just want to see the ffmpeg command error.
  
  form.append('video', dummyVideo, { filename: 'video.mp4' });
  form.append('srt', Buffer.from('1\n00:00:00,000 --> 00:00:01,000\nHello'), { filename: 'subtitles.srt' });
  
  const res = await fetch(`http://localhost:3000/api/export-video`, {
    method: 'POST',
    body: form
  });
  console.log("Status:", res.status);
  console.log("Text:", await res.text());
}
run().catch(console.error);
