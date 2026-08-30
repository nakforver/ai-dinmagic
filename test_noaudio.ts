import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);
async function run() {
    try {
        const cmd = `ffmpeg -hide_banner -loglevel error -f lavfi -i color=c=black:s=1280x720:d=1 -filter_complex "[0:a]volume=0.1[a0]; [a0]amix=inputs=1:normalize=0[aout]" -map "0:v" -map "[aout]" -c:v libx264 -c:a aac -y /tmp/test_noaudio.mp4`;
        const { stdout, stderr } = await execAsync(cmd);
        console.log("Success", stdout, stderr);
    } catch(e: any) {
        console.log("Error", e.message, e.stderr);
    }
}
run();
