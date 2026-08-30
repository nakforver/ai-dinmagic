const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `         originalLines = originalLines.map(line => ({
             id: line.id,
             start: formatTimestamp(line.start),
             end: formatTimestamp(line.end),
             text: line.text
         }));`;

const replacement = `         originalLines = originalLines.map(line => ({
             id: line.id,
             start: formatTimestamp(line.start),
             end: formatTimestamp(line.end),
             text: line.text
         }));
         
         if (originalLines.length === 0) {
             throw new Error("AWS Transcribe មិនអាចស្គាល់សំឡេងបានទេ (No speech detected). អាចដោយសារវីដេអូគ្មានសំឡេង ឬប្រើភាសាដែលប្រព័ន្ធមិនស្គាល់។");
         }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched AWS empty lines check");
} else {
    console.log("Target not found");
}
