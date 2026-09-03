const fs = require('fs');

const file = 'server.ts';
let s = fs.readFileSync(file, 'utf8');

if (s.includes('QWEN_ASR_URL')) {
  console.log('Qwen patch already exists.');
  process.exit(0);
}

/*
 * QWEN KHMER ASR
 *
 * Qwen ASR runs separately in:
 *   ~/qwen-asr
 *
 * FastAPI:
 *   http://127.0.0.1:8000/transcribe
 *
 * Pipeline:
 *   Audio
 *      ↓
 *   Qwen Khmer ASR
 *      ↓
 *   Gemini transcript correction
 *      ↓
 *   Gemini Khmer translation
 *      ↓
 *   TTS
 */

const marker = "const activeModel = model || 'gemini-2.5-flash';";

const insert = `const activeModel = model || 'gemini-2.5-flash';

/*
 * QWEN KHMER ASR
 * Qwen runs separately in ~/qwen-asr
 */
const QWEN_ASR_URL =
  process.env.QWEN_ASR_URL || 'http://127.0.0.1:8000/transcribe';

async function transcribeWithQwen(
  audioPath: string,
  filename = 'audio.mp3'
): Promise<string> {

  console.log('[QWEN ASR] Sending audio to:', QWEN_ASR_URL);

  const audioBuffer = fs.readFileSync(audioPath);

  const form = new FormData();

  const blob = new Blob([audioBuffer], {
    type: 'audio/mpeg'
  });

  form.append('file', blob, filename);

  const response = await fetch(QWEN_ASR_URL, {
    method: 'POST',
    body: form
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      'Qwen ASR failed (' +
      response.status +
      '): ' +
      errorText
    );
  }

  const result: any = await response.json();

  if (!result.text || !result.text.trim()) {
    throw new Error('Qwen ASR returned empty transcript.');
  }

  console.log(
    '[QWEN ASR] Transcript length:',
    result.text.length
  );

  return result.text.trim();
}
`;

if (!s.includes(marker)) {
  console.error('Could not find insertion marker.');
  process.exit(1);
}

s = s.replace(marker, insert);

fs.writeFileSync(file, s);

console.log('Qwen patch applied successfully.');
