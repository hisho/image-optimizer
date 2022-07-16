import { exec } from 'child_process'

exec(`node ./bin/index.js`, (_, stdout, stderr) => console.log(stdout, stderr))
