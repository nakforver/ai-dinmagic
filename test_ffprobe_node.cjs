const util = require('util');
const exec = util.promisify(require('child_process').exec);
async function run() {
  const { stdout } = await exec(`ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "no_audio.mp4"`);
  console.log("stdout:", JSON.stringify(stdout));
  console.log("length:", stdout.trim().length);
}
run();
