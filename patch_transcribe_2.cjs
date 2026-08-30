const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const startIndex = code.indexOf("if (activeModel === 'amazon') {");
const endIndex = code.indexOf("// Upload to Gemini");

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find blocks");
    process.exit(1);
}

const replacementStr = `if (activeModel === 'amazon') {
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
             IdentifyLanguage: true,
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
             jobs.set(jobId, { status: 'transcribing with amazon', progress: 50 + Math.min(retries * 2, 35) });
         }
         
         jobs.set(jobId, { status: 'processing results', progress: 85 });
         
         const resultRes = await fetch(transcriptUri);
         const resultJson = await resultRes.json();
         
         // Parse resultJson to {id, start, end, text}
         const items = resultJson.results?.items || [];
         let originalLines = [];
         let currentLine = null;
         
         for (const item of items) {
             if (item.type === 'pronunciation') {
                 if (!currentLine) {
                     currentLine = { id: Math.random().toString(), start: item.start_time, end: item.end_time, text: item.alternatives[0].content };
                 } else {
                     // Check if gap is > 1.5 seconds, start new line
                     if (parseFloat(item.start_time) - parseFloat(currentLine.end) > 1.5) {
                         originalLines.push(currentLine);
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
         if (currentLine) originalLines.push(currentLine);
         
         // Helper to convert float seconds to M:SS.S
         const formatTimestamp = (secStr) => {
             const secFloat = parseFloat(secStr);
             const mins = Math.floor(secFloat / 60);
             const secs = secFloat % 60;
             return \`\${mins}:\${secs.toFixed(1).padStart(4, '0')}\`;
         };
         
         originalLines = originalLines.map(line => ({
             id: line.id,
             start: formatTimestamp(line.start),
             end: formatTimestamp(line.end),
             text: line.text
         }));

         jobs.set(jobId, { status: 'translating to khmer', progress: 90 });
         console.log(\`Translating \${originalLines.length} lines to Khmer...\`);
         
         // Translate via Gemini in chunks
         const CHUNK_SIZE = 40;
         let translatedLines = [];
         
         for (let i = 0; i < originalLines.length; i += CHUNK_SIZE) {
             const chunk = originalLines.slice(i, i + CHUNK_SIZE);
             let chunkSuccess = false;
             let generateRetries = 0;
             
             while (!chunkSuccess && generateRetries < 3) {
                 try {
                     const response = await currentAi.models.generateContent({
                         model: 'gemini-2.5-flash',
                         contents: [{
                             role: 'user',
                             parts: [
                                 { text: 'You are a professional subtitle translator. Translate the "text" fields in the following JSON array from its original language into Khmer (Cambodian). Keep the exact same JSON structure, keep the "id", "start", and "end" fields exactly the same. Only translate the "text" field. Return ONLY a valid JSON array.\\n\\n' + JSON.stringify(chunk) }
                             ]
                         }],
                         config: {
                             responseMimeType: 'application/json',
                         }
                     });
                     
                     let responseText = response.text || '';
                     const parsedChunk = JSON.parse(responseText.replace(/^\\s*\`\`\`json\\s*/, '').replace(/\\s*\`\`\`\\s*$/, ''));
                     
                     // Ensure no fields were dropped
                     const validatedChunk = parsedChunk.map((item, index) => ({
                         id: chunk[index].id,
                         start: chunk[index].start,
                         end: chunk[index].end,
                         text: item.text || item.Text || chunk[index].text
                     }));

                     translatedLines.push(...validatedChunk);
                     chunkSuccess = true;
                 } catch (err) {
                     console.error(\`Translation chunk \${i} error:\`, err.message);
                     generateRetries++;
                     if (generateRetries >= 3) throw new Error("Translation via Gemini failed after 3 attempts.");
                     await new Promise(r => setTimeout(r, 3000));
                 }
             }
             
             const translateProgress = 90 + Math.floor((i / originalLines.length) * 10);
             const percent = Math.floor(Math.min(100, ((i + CHUNK_SIZE) / originalLines.length) * 100));
             jobs.set(jobId, { status: \`translating (\${percent}%)\`, progress: Math.min(99, translateProgress) });
         }
         
         // Cleanup S3
         try {
             await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: s3Key }));
         } catch(e) { console.error('Failed to cleanup S3', e); }
         
         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
         if (uploadPath !== filePath && fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
         
         jobs.set(jobId, { status: 'done', progress: 100, lines: translatedLines });
         return; // Exit here for Amazon
      }
      
      `;

code = code.substring(0, startIndex) + replacementStr + code.substring(endIndex);
fs.writeFileSync('server.ts', code);
console.log('Patched Amazon logic for 2-step translation.');
