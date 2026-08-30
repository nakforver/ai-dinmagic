const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'amix=inputs=${inputCount}:normalize=0[aout];',
  'amix=inputs=${inputCount}:duration=first:dropout_transition=2[aout];'
);

fs.writeFileSync('server.ts', code);
