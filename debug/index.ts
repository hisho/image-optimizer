import { exec } from 'child_process'

exec(`cd debug/withNext && node ./../../bin/index.js`, (_, stdout, stderr) =>
  console.log(stdout, stderr)
)
