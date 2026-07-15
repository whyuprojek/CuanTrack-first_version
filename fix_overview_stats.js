const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /<span class="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-1">[\s\S]*?<i data-lucide="trending-up" class="w-3.5 h-3.5"><\/i> \+4\.2% bulan ini[\s\S]*?<\/span>/;
const replacement = `<span class="text-xs text-emerald-500 font-semibold flex items-center gap-1 mt-1">
                    <i data-lucide="trending-up" class="w-3.5 h-3.5"></i> \${state.summaryData.savingRate?.savingRate || 0}% Saving Rate
                </span>`;

html = html.replace(regex, replacement);
fs.writeFileSync('public/index.html', html);
