const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/transcribe/status', (req, res) => {`;
const replacement = `app.get('/api/debug/jobs', (req, res) => {
    const allJobs = {};
    for (const [k, v] of jobs.entries()) {
        allJobs[k] = { status: v.status, progress: v.progress, error: v.error, linesCount: v.lines ? v.lines.length : 0 };
    }
    res.json(allJobs);
});

app.get('/api/transcribe/status', (req, res) => {`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('server.ts', code);
    console.log("Patched server.ts with debug endpoint");
}
