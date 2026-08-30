const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const target = `            </div>
          </div>
        </section>`;

const replacement = `            </div>
            
            <div className="flex justify-end pt-2">
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

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/Settings.tsx', code);
    console.log("Patched Settings.tsx with test button");
} else {
    console.log("Target not found");
}
