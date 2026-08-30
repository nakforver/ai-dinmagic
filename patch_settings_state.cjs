const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const importTarget = `import { ViewState } from '../types';`;
const importReplacement = `import { useState } from 'react';\nimport { ViewState } from '../types';`;

code = code.replace(importTarget, importReplacement);

const propsTarget = `export default function Settings({ onNavigate, apiKey, setApiKey, awsAccessKeyId, setAwsAccessKeyId, awsSecretAccessKey, setAwsSecretAccessKey, awsRegion, setAwsRegion, awsS3Bucket, setAwsS3Bucket, model, setModel, voice, setVoice, volume, setVolume }: SettingsProps) {`;
const propsReplacement = `export default function Settings({ onNavigate, apiKey, setApiKey, awsAccessKeyId, setAwsAccessKeyId, awsSecretAccessKey, setAwsSecretAccessKey, awsRegion, setAwsRegion, awsS3Bucket, setAwsS3Bucket, model, setModel, voice, setVoice, volume, setVolume }: SettingsProps) {
  const [testMessage, setTestMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [isTesting, setIsTesting] = useState(false);`;

code = code.replace(propsTarget, propsReplacement);

const buttonTarget = `            <div className="flex justify-end pt-2">
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/test-aws', {
                      method: 'POST',
                      headers: {
                        'x-aws-access-key-id': awsAccessKeyId,
                        'x-aws-secret-access-key': awsSecretAccessKey,
                        'x-aws-region': awsRegion,
                        'x-aws-s3-bucket': awsS3Bucket
                      }
                    });
                    const data = await res.json();
                    if (res.ok) {
                      alert('ជោគជ័យ: ' + data.message);
                    } else {
                      alert('បរាជ័យ: ' + data.error);
                    }
                  } catch(e) {
                    alert('បរាជ័យ: មិនអាចភ្ជាប់ទៅកាន់ Server បាន');
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition"
              >
                សាកល្បងភ្ជាប់ AWS (Test Connection)
              </button>
            </div>
          </div>
        </section>`;

// I also need to move the button to the AWS CREDENTIALS section. 
// First, I'll remove the button from the API KEY section.

const apiSectionEnd = `              />
            </div>
          </div>
        </section>`;

code = code.replace(buttonTarget, apiSectionEnd);

const awsSectionEndTarget = `              />
            </div>
          </div>
        </section>`;

const awsSectionEndReplacement = `              />
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              {testMessage && (
                <div className={\`p-3 rounded-lg text-sm \${testMessage.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}\`}>
                  {testMessage.text}
                </div>
              )}
              <button
                disabled={isTesting}
                onClick={async () => {
                  setIsTesting(true);
                  setTestMessage(null);
                  try {
                    const res = await fetch('/api/test-aws', {
                      method: 'POST',
                      headers: {
                        'x-aws-access-key-id': awsAccessKeyId,
                        'x-aws-secret-access-key': awsSecretAccessKey,
                        'x-aws-region': awsRegion,
                        'x-aws-s3-bucket': awsS3Bucket
                      }
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setTestMessage({ type: 'success', text: data.message });
                    } else {
                      setTestMessage({ type: 'error', text: data.error });
                    }
                  } catch(e) {
                    setTestMessage({ type: 'error', text: 'បរាជ័យ: មិនអាចភ្ជាប់ទៅកាន់ Server បាន' });
                  } finally {
                    setIsTesting(false);
                  }
                }}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2"
              >
                {isTesting ? 'កំពុងសាកល្បង...' : 'សាកល្បងភ្ជាប់ AWS (Test Connection)'}
              </button>
            </div>
          </div>
        </section>`;

code = code.replace(awsSectionEndTarget, awsSectionEndReplacement);

fs.writeFileSync('src/components/Settings.tsx', code);
console.log("Patched Settings.tsx state and position");
