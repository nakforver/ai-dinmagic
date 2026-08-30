const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldLoop = `         for (const item of items) {
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
         }`;

const newLoop = `         let wordCount = 0;
         for (const item of items) {
             if (item.type === 'pronunciation') {
                 if (!currentLine) {
                     currentLine = { id: Math.random().toString(), start: item.start_time, end: item.end_time, text: item.alternatives[0].content };
                     wordCount = 1;
                 } else {
                     const gap = parseFloat(item.start_time) - parseFloat(currentLine.end);
                     const duration = parseFloat(item.end_time) - parseFloat(currentLine.start);
                     const isPunctuationEnding = currentLine.text.match(/[.!?]$/);
                     
                     // Tighter chunking for perfect lip sync:
                     // 1. Pause > 0.5s
                     // 2. Line duration > 3.5s (don't make sentences too long)
                     // 3. Word count >= 10 words
                     // 4. Sentence ended (punctuation) + slight pause
                     if (gap > 0.5 || duration > 3.5 || wordCount >= 10 || (isPunctuationEnding && gap > 0.2)) {
                         originalLines.push(currentLine);
                         currentLine = { id: Math.random().toString(), start: item.start_time, end: item.end_time, text: item.alternatives[0].content };
                         wordCount = 1;
                     } else {
                         currentLine.end = item.end_time;
                         currentLine.text += " " + item.alternatives[0].content;
                         wordCount++;
                     }
                 }
             } else if (item.type === 'punctuation' && currentLine) {
                 currentLine.text += item.alternatives[0].content;
             }
         }`;

if (code.includes(oldLoop)) {
    code = code.replace(oldLoop, newLoop);
    fs.writeFileSync('server.ts', code);
    console.log("Updated loop for better sync!");
} else {
    console.log("Could not find old loop to replace.");
}
