import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
const execAsync = util.promisify(exec);
async function run() {
    fs.writeFileSync('/tmp/test_sub:foo.srt', `1
00:00:00,000 --> 00:00:01,000
សួស្តី
`);
    try {
        const srtPath = '/tmp/test_sub:foo.srt';
        const escapedSrtPath = srtPath.replace(/\\/g, '/').replace(/'/g, "\\\\'").replace(/:/g, "\\\\:");
        const cmd = `ffmpeg -hide_banner -loglevel error -f lavfi -i color=c=black:s=1280x720:d=1 -vf "subtitles='${escapedSrtPath}'" -y /tmp/test_sub.mp4`;
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd);
        console.log("Success", stdout, stderr);
    } catch(e: any) {
        console.log("Error", e.message, e.stderr);
    }
}
run();
