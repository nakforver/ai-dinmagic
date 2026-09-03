from pathlib import Path

p = Path("server.ts")
s = p.read_text()

marker = "      if (activeModel === 'amazon') {"

if "if (activeModel === 'qwen-khmer')" in s:
    print("Qwen backend branch already exists.")
    raise SystemExit(0)

if marker not in s:
    raise SystemExit("Could not find Amazon branch.")

branch = r'''      /*
       * ============================================================
       * QWEN KHMER ASR PIPELINE
       * ============================================================
       *
       * Video
       *   ↓
       * FFmpeg → MP3
       *   ↓
       * Qwen Khmer ASR
       *   ↓
       * Gemini corrects the raw transcript
       *   ↓
       * Gemini creates Khmer subtitle lines + timestamps
       *
       * Qwen ASR is running separately in:
       *   ~/qwen-asr
       *
       * FastAPI:
       *   http://127.0.0.1:8000/transcribe
       */
      if (activeModel === 'qwen-khmer') {
        try {
          jobs.set(jobId, {
            status: 'transcribing with Qwen Khmer ASR',
            progress: 50
          });

          console.log('[QWEN] Starting Khmer ASR...');
          console.log('[QWEN] Audio:', uploadPath);

          // Send extracted MP3 to local Qwen ASR server.
          const rawTranscript = await transcribeWithQwen(
            uploadPath,
            path.basename(uploadPath)
          );

          console.log(
            '[QWEN] Raw transcript:',
            rawTranscript.substring(0, 500)
          );

          jobs.set(jobId, {
            status: 'correcting transcript with Gemini',
            progress: 65
          });

          /*
           * IMPORTANT:
           * Qwen is used as the primary ASR.
           *
           * Gemini receives the Qwen transcript and corrects
           * obvious recognition errors using the audio as context.
           *
           * We then ask Gemini to create subtitle timestamps.
           */
          const correctionPrompt = `
You are a professional Khmer subtitle editor.

The transcript below was produced by a Khmer ASR model.

Your job:
1. Correct obvious ASR recognition mistakes.
2. Preserve the actual meaning and spoken words.
3. Do NOT invent dialogue.
4. Do NOT translate yet.
5. Keep Khmer words natural and readable.
6. Remove obvious repeated hallucinations caused by ASR.
7. Return ONLY the corrected Khmer transcript as plain text.

QWEN ASR TRANSCRIPT:
${rawTranscript}
`;

          const correctionResponse =
            await currentAi.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [{
                role: 'user',
                parts: [
                  { text: correctionPrompt }
                ]
              }]
            });

          const correctedTranscript =
            (correctionResponse.text || '').trim();

          if (!correctedTranscript) {
            throw new Error(
              'Gemini returned an empty corrected transcript.'
            );
          }

          console.log(
            '[QWEN] Corrected transcript length:',
            correctedTranscript.length
          );

          jobs.set(jobId, {
            status: 'creating Khmer subtitles',
            progress: 75
          });

          /*
           * Gemini now creates subtitle lines.
           *
           * The Qwen transcript is treated as the source text.
           * Gemini should NOT perform a second independent
           * transcription.
           */
          const subtitlePrompt = `
You are a professional Khmer subtitle editor.

Create Khmer subtitles for the supplied audio.

IMPORTANT:
- The Qwen ASR transcript below is the PRIMARY transcript.
- Use it as the source of spoken content.
- Do NOT invent words.
- Do NOT omit spoken dialogue.
- Keep the Khmer meaning faithful.
- Split naturally into short subtitle lines.
- Each line must have accurate start/end timestamps.
- Timestamp format MUST be M:SS.S
- Return ONLY valid JSON.
- Schema:
  [
    {
      "id": "string",
      "start": "M:SS.S",
      "end": "M:SS.S",
      "text": "Khmer subtitle"
    }
  ]

CORRECTED QWEN TRANSCRIPT:
${correctedTranscript}
`;

          /*
           * Upload the audio to Gemini only for timing/context.
           * Gemini must follow the corrected Qwen transcript.
           */
          const qwenAudioBuffer = fs.readFileSync(uploadPath);
          const qwenAudioBlob = new Blob([qwenAudioBuffer]);

          const qwenGeminiUpload =
            await currentAi.files.upload({
              file: qwenAudioBlob,
              config: { mimeType: uploadMime }
            });

          let qwenFileState =
            await currentAi.files.get({
              name: qwenGeminiUpload.name
            });

          let qwenFileRetries = 0;

          while (
            qwenFileState.state === 'PROCESSING' &&
            qwenFileRetries < 40
          ) {
            await new Promise(r => setTimeout(r, 3000));

            qwenFileState =
              await currentAi.files.get({
                name: qwenGeminiUpload.name
              });

            qwenFileRetries++;
          }

          if (qwenFileState.state === 'FAILED') {
            throw new Error(
              'Gemini audio processing failed while creating timestamps.'
            );
          }

          const subtitleResponse =
            await currentAi.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [{
                role: 'user',
                parts: [
                  { text: subtitlePrompt },
                  {
                    fileData: {
                      fileUri: qwenGeminiUpload.uri,
                      mimeType: uploadMime
                    }
                  }
                ]
              }],
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      start: { type: Type.STRING },
                      end: { type: Type.STRING },
                      text: { type: Type.STRING }
                    },
                    required: [
                      "id",
                      "start",
                      "end",
                      "text"
                    ]
                  }
                }
              }
            });

          let qwenResponseText =
            subtitleResponse.text || '';

          qwenResponseText = qwenResponseText
            .replace(/^\s*```json\s*/, '')
            .replace(/\s*```\s*$/, '')
            .trim();

          let qwenLines;

          try {
            qwenLines = JSON.parse(qwenResponseText);
          } catch (parseError) {
            throw new Error(
              'Could not parse subtitle JSON from Gemini: ' +
              qwenResponseText.substring(0, 500)
            );
          }

          if (
            !Array.isArray(qwenLines) ||
            qwenLines.length === 0
          ) {
            throw new Error(
              'Qwen/Gemini subtitle generation returned 0 lines.'
            );
          }

          /*
           * Ensure every line has the expected structure.
           */
          qwenLines = qwenLines
            .filter((line: any) =>
              line &&
              typeof line.text === 'string' &&
              line.text.trim()
            )
            .map((line: any, index: number) => ({
              id: String(
                line.id || `${jobId}-qwen-${index + 1}`
              ),
              start: String(line.start || '0:00.0'),
              end: String(line.end || line.start || '0:00.0'),
              text: String(line.text).trim()
            }));

          if (qwenLines.length === 0) {
            throw new Error(
              'No valid subtitle lines were generated from Qwen transcript.'
            );
          }

          try {
            await currentAi.files.delete({
              name: qwenGeminiUpload.name
            });
          } catch (cleanupError) {
            console.error(
              '[QWEN] Failed to delete Gemini audio:',
              cleanupError
            );
          }

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          if (
            uploadPath !== filePath &&
            fs.existsSync(uploadPath)
          ) {
            fs.unlinkSync(uploadPath);
          }

          jobs.set(jobId, {
            status: 'done',
            progress: 100,
            lines: qwenLines
          });

          console.log(
            `[QWEN] Completed successfully: ${qwenLines.length} subtitle lines`
          );

          return;
        } catch (qwenError: any) {
          console.error(
            '[QWEN ASR ERROR]',
            qwenError
          );

          throw new Error(
            'Qwen Khmer ASR failed: ' +
            (qwenError?.message || qwenError)
          );
        }
      }

'''

s = s.replace(marker, branch + marker, 1)
p.write_text(s)

print("Qwen backend branch added successfully.")
