const { execAsync } = require('child_process');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
async function run() {
  try {
    await exec('ls /nonexistent-file');
  } catch(err) {
    console.log("MESSAGE:\n", err.message);
    console.log("STDERR:\n", err.stderr);
  }
}
run();
