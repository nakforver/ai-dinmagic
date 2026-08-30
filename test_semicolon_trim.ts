import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);
async function run() {
    try {
        let filterComplex = '[1:a]adelay=0|0[a1]; [a1]amix=inputs=1:normalize=0[aout]; ';
        // trim trailing semicolon and whitespace
        filterComplex = filterComplex.replace(/;\s*$/, '');
        
        const cmd = `ffmpeg -hide_banner -loglevel error -f lavfi -i color=c=black:s=1280x720:d=1 -f lavfi -i anullsrc=r=44100:cl=stereo:d=1 -filter_complex "${filterComplex}" -map "0:v" -map "[aout]" -c:v libx264 -c:a aac -y /tmp/test_trim.mp4`;
        console.log(cmd);
        const { stdout, stderr } = await execAsync(cmd);
        console.log("Success", stdout, stderr);
    } catch(e: any) {
        console.log("Error", e.message, e.stderr);
    }
}
run();
