const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will now try removing dropout_transition as well, as it might be causing the invalid data issue on some inputs
code = code.replace(
  'amix=inputs=${inputCount}:dropout_transition=2[aout];',
  'amix=inputs=${inputCount}[aout];'
);

fs.writeFileSync('server.ts', code);
