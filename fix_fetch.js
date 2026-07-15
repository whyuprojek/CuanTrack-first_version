const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const fetchRegex = /\/\/ Fetch user transactions[\s\S]*?\/\/ Fetch user summary/;
const newFetch = `// Fetch user summary`;

html = html.replace(fetchRegex, newFetch);

const summaryRegex = /state\.summaryData = await summaryRes\.json\(\);/;
const newSummary = `state.summaryData = await summaryRes.json();
            // Use transactions from the summary report
            state.transactions = state.summaryData.recentTransactions || [];`;

html = html.replace(summaryRegex, newSummary);
fs.writeFileSync('public/index.html', html);
