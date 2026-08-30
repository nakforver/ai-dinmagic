const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const fs = require('fs');

async function test() {
    await execAsync(`ffmpeg -f lavfi -i color=c=black:s=128x128:d=1 -f lavfi -i anullsrc=r=44100:cl=stereo:d=1 -c:v libx264 -c:a aac test.mp4 -y`);
    console.log("Created test.mp4");
    
    await execAsync(`ffmpeg -hide_banner -loglevel error -i "test.mp4" -vn -acodec libmp3lame -q:a 2 "test.mp3" -y`);
    console.log("Extracted test.mp3");
    console.log("MP3 size:", fs.statSync("test.mp3").size);
}

test().catch(console.error);
