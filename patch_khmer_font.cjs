const fs = require('fs');

const file = 'server.ts';
let s = fs.readFileSync(file, 'utf8');

const oldCode = `vFilter = \`subtitles='\\${escapedSrtPath}'\`;`;

const newCode = `
// Force a Khmer-capable font for FFmpeg/libass.
// This prevents Khmer glyphs from rendering as [].
vFilter = \`subtitles='\\${escapedSrtPath}':force_style='FontName=Noto Sans Khmer,FontSize=24'\`;
`;

if (!s.includes(oldCode)) {
  console.error('Target FFmpeg subtitle line not found.');
  process.exit(1);
}

s = s.replace(oldCode, newCode);

fs.writeFileSync(file, s);
console.log('Khmer subtitle font patch applied successfully.');
