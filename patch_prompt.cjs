const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `{ text: 'You are a professional subtitle translator. Listen to the video and TRANSLATE the speech into Khmer (Cambodian) language. ALL subtitle text MUST be in the Khmer language. Do NOT output the original language (e.g., do not output Korean, English, etc.). Break the translation down into subtitle lines with start and end timestamps in the format "M:SS.S" (or "H:MM:SS.S" if longer). Return ONLY a valid JSON array of objects with the following schema: { id: string, start: string, end: string, text: string }' },`;

const replacement = `{ text: 'You are a professional subtitle translator. You MUST transcribe and translate the ENTIRE audio into Khmer (Cambodian). DO NOT skip any dialogue. Pay close attention to the entire duration. ALL subtitle text MUST be in the Khmer language. Do NOT output the original language. Break the translation down into sequential subtitle lines with accurate start and end timestamps (M:SS.S). If the video is long, you must process as much as you can. Return ONLY a valid JSON array of objects with the schema: { id: string, start: string, end: string, text: string }. Do not output an empty array unless there is absolutely zero speech.' },`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched prompt");
} else {
    console.log("Target not found");
}
