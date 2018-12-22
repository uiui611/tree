import fs from 'fs';
const [,,
    target
] = process.argv;

if(!fs.existsSync(target)) fs.mkdirSync(target);