const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const targetProps = `  awsAccessKeyId: string;
  setAwsAccessKeyId: (key: string) => void;
  awsSecretAccessKey: string;
  setAwsSecretAccessKey: (key: string) => void;`;

const repProps = `  awsAccessKeyId: string;
  setAwsAccessKeyId: (key: string) => void;
  awsSecretAccessKey: string;
  setAwsSecretAccessKey: (key: string) => void;
  awsRegion: string;
  setAwsRegion: (val: string) => void;
  awsS3Bucket: string;
  setAwsS3Bucket: (val: string) => void;`;

code = code.replace(targetProps, repProps);

const targetSig = `export default function Settings({ onNavigate, apiKey, setApiKey, awsAccessKeyId, setAwsAccessKeyId, awsSecretAccessKey, setAwsSecretAccessKey, model, setModel, voice, setVoice, volume, setVolume }: SettingsProps) {`;

const repSig = `export default function Settings({ onNavigate, apiKey, setApiKey, awsAccessKeyId, setAwsAccessKeyId, awsSecretAccessKey, setAwsSecretAccessKey, awsRegion, setAwsRegion, awsS3Bucket, setAwsS3Bucket, model, setModel, voice, setVoice, volume, setVolume }: SettingsProps) {`;

code = code.replace(targetSig, repSig);

const targetUI = `            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/20 rounded-lg shrink-0">
                <Key size={18} className="text-blue-500" />
              </div>
              <input
                type="password"
                className="bg-transparent text-sm font-mono tracking-wider text-gray-200 outline-none w-full"
                placeholder="AWS Secret Access Key"
                value={awsSecretAccessKey}
                onChange={(e) => setAwsSecretAccessKey(e.target.value)}
              />
            </div>
          </div>`;

const repUI = `            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/20 rounded-lg shrink-0">
                <Key size={18} className="text-blue-500" />
              </div>
              <input
                type="password"
                className="bg-transparent text-sm font-mono tracking-wider text-gray-200 outline-none w-full"
                placeholder="AWS Secret Access Key"
                value={awsSecretAccessKey}
                onChange={(e) => setAwsSecretAccessKey(e.target.value)}
              />
            </div>
            <div className="h-px bg-gray-800/80 w-full"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/20 rounded-lg shrink-0">
                <Key size={18} className="text-blue-400" />
              </div>
              <input
                type="text"
                className="bg-transparent text-sm font-mono tracking-wider text-gray-200 outline-none w-full"
                placeholder="AWS Region (e.g. ap-southeast-2)"
                value={awsRegion}
                onChange={(e) => setAwsRegion(e.target.value)}
              />
            </div>
            <div className="h-px bg-gray-800/80 w-full"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/20 rounded-lg shrink-0">
                <Key size={18} className="text-blue-400" />
              </div>
              <input
                type="text"
                className="bg-transparent text-sm font-mono tracking-wider text-gray-200 outline-none w-full"
                placeholder="AWS S3 Bucket Name"
                value={awsS3Bucket}
                onChange={(e) => setAwsS3Bucket(e.target.value)}
              />
            </div>
          </div>`;

code = code.replace(targetUI, repUI);

fs.writeFileSync('src/components/Settings.tsx', code);
console.log("Patched Settings.tsx for 4 slots");
