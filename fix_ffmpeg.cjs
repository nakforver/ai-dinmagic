const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'let ffmpegCmd = `ffmpeg -hide_banner -loglevel error -i "${videoFile.path}" -y`;',
  'let ffmpegCmd = `ffmpeg -nostdin -hide_banner -loglevel error -i "${videoFile.path}"`;'
);

code = code.replace(
  'ffmpegCmd += ` "${outputVideoPath}"`;',
  'ffmpegCmd += ` -y "${outputVideoPath}"`;'
);

fs.writeFileSync('server.ts', code);
