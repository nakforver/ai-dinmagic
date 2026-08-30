const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Add imports if not exist
if (!code.includes('@aws-sdk/client-s3')) {
    code = `import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from "@aws-sdk/client-transcribe";
import fetch from "node-fetch";
` + code;
}

const targetStr = `      // Upload to Gemini
      console.log(\`Uploading file to Gemini... \${uploadPath}\`);`;

const replacementStr = `      const activeModel = model || 'gemini-2.5-flash';
      
      if (activeModel === 'amazon') {
         jobs.set(jobId, { status: 'uploading to s3', progress: 45 });
         console.log(\`Uploading file to S3... \${uploadPath}\`);
         
         const region = process.env.AWS_REGION || 'ap-southeast-2';
         const bucket = process.env.AWS_S3_BUCKET || 'elasticbeanstalk-ap-southeast-2-824353504213';
         
         const awsConfig = {
           region,
           credentials: {
             accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
             secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
           }
         };
         
         if (!awsConfig.credentials.accessKeyId) {
             throw new Error("ការកំណត់ AWS Credentials មិនទាន់បានបំពេញ (AWS_ACCESS_KEY_ID នៅក្នុងកូដម៉ាស៊ីន)។");
         }
         
         const s3Client = new S3Client(awsConfig);
         const transcribeClient = new TranscribeClient(awsConfig);
         
         const s3Key = \`uploads/\${jobId}_audio.mp3\`;
         const uploadStream = fs.createReadStream(uploadPath);
         
         await s3Client.send(new PutObjectCommand({
             Bucket: bucket,
             Key: s3Key,
             Body: uploadStream
         }));
         
         jobs.set(jobId, { status: 'transcribing with amazon', progress: 50 });
         
         const transcribeJobName = \`TranscribeJob_\${jobId}\`;
         await transcribeClient.send(new StartTranscriptionJobCommand({
             TranscriptionJobName: transcribeJobName,
             LanguageCode: "km-KH",
             MediaFormat: "mp3",
             Media: { MediaFileUri: \`s3://\${bucket}/\${s3Key}\` },
         }));
         
         let transcribeStatus = 'IN_PROGRESS';
         let transcriptUri = '';
         let retries = 0;
         while (transcribeStatus === 'IN_PROGRESS' || transcribeStatus === 'QUEUED') {
             await new Promise(r => setTimeout(r, 5000));
             const jobRes = await transcribeClient.send(new GetTranscriptionJobCommand({ TranscriptionJobName: transcribeJobName }));
             transcribeStatus = jobRes.TranscriptionJob?.TranscriptionJobStatus || 'FAILED';
             
             if (transcribeStatus === 'COMPLETED') {
                 transcriptUri = jobRes.TranscriptionJob?.Transcript?.TranscriptFileUri || '';
                 break;
             }
             if (transcribeStatus === 'FAILED') {
                 throw new Error("ការបកប្រែតាមរយៈ Amazon ទទួលបរាជ័យ: " + jobRes.TranscriptionJob?.FailureReason);
             }
             retries++;
             jobs.set(jobId, { status: 'transcribing with amazon', progress: 50 + Math.min(retries * 2, 40) });
         }
         
         jobs.set(jobId, { status: 'processing results', progress: 95 });
         
         const resultRes = await fetch(transcriptUri);
         const resultJson = await resultRes.json();
         
         // Parse resultJson to {id, start, end, text}
         const items = resultJson.results?.items || [];
         let lines = [];
         let currentLine = null;
         
         for (const item of items) {
             if (item.type === 'pronunciation') {
                 if (!currentLine) {
                     currentLine = { id: Math.random().toString(), start: item.start_time, end: item.end_time, text: item.alternatives[0].content };
                 } else {
                     // Check if gap is > 1.5 seconds, start new line
                     if (parseFloat(item.start_time) - parseFloat(currentLine.end) > 1.5) {
                         lines.push(currentLine);
                         currentLine = { id: Math.random().toString(), start: item.start_time, end: item.end_time, text: item.alternatives[0].content };
                     } else {
                         currentLine.end = item.end_time;
                         currentLine.text += " " + item.alternatives[0].content;
                     }
                 }
             } else if (item.type === 'punctuation' && currentLine) {
                 currentLine.text += item.alternatives[0].content;
             }
         }
         if (currentLine) lines.push(currentLine);
         
         // Helper to convert float seconds to M:SS.S
         const formatTimestamp = (secStr) => {
             const secFloat = parseFloat(secStr);
             const mins = Math.floor(secFloat / 60);
             const secs = secFloat % 60;
             return \`\${mins}:\${secs.toFixed(1).padStart(4, '0')}\`;
         };
         
         lines = lines.map(line => ({
             id: line.id,
             start: formatTimestamp(line.start),
             end: formatTimestamp(line.end),
             text: line.text
         }));
         
         // Cleanup S3
         try {
             await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
         } catch(e) { console.error('Failed to cleanup S3', e); }
         
         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
         if (uploadPath !== filePath && fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
         
         jobs.set(jobId, { status: 'done', progress: 100, lines });
         return; // Exit here for Amazon
      }
      
      // Upload to Gemini
      console.log(\`Uploading file to Gemini... \${uploadPath}\`);`;

code = code.replace(targetStr, replacementStr);

fs.writeFileSync('server.ts', code);
console.log('Patched server.ts with AWS logic');
