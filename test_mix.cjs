const { execSync } = require('child_process');
const fs = require('fs');

try {
  let cmd = 'ffmpeg -hide_banner -loglevel error -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -y dummy.m4a';
  execSync(cmd);
  
  let inputs = '-i dummy.m4a ';
  let filter = '[0:a]volume=0.1[a0]; ';
  let maps = '[a0]';
  for(let i=1; i<74; i++) {
    inputs += '-i dummy.m4a ';
    filter += `[${i}:a]adelay=${i*1000}|${i*1000}[a${i}]; `;
    maps += `[a${i}]`;
  }
  filter += `${maps}amix=inputs=74:duration=longest,volume=74[aout]`;
  let fullCmd = `ffmpeg -hide_banner -loglevel error ${inputs}-filter_complex "${filter}" -map "[aout]" -c:a aac -b:a 192k -y test_mixed.m4a`;
  
  execSync(fullCmd);
  console.log("Success");
} catch(e) {
  console.error("Failed:", e.message, e.stderr?.toString());
}
