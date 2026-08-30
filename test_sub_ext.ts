import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
const execAsync = util.promisify(exec);
async function run() {
    fs.writeFileSync('/tmp/test_sub_noext', `1
00:00:00,000 --> 00:00:01,000
Hello
`);
    try {
        const cmd = `ffmpeg -hide_banner -loglevel error -f lavfi -i color=c=black:s=1280x720:d=1 -vf "subtitles='/tmp/test_sub_noext'" -y /tmp/test_ext.mp4`;
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd);
        console.log("Success", stdout, stderr);
    } catch(e: any) {
        console.log("Error", e.message, e.stderr);
    }
}
run();
