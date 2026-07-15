const fs = require('fs');

let code = fs.readFileSync('handlers/transaction.js', 'utf8');

// just checking what's there
console.log(code.substring(0, 500));
