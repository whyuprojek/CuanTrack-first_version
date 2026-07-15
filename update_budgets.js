const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const regex = /function renderBudgets\(container\) \{[\s\S]*?container\.appendChild\(card\);\s*\}/;

const newContent = `function renderBudgets(container) {
        const card = document.createElement('div');
        card.className = "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6";
        card.innerHTML = \`
            <div>
                <h3 class="text-lg font-bold text-slate-800">Alokasi & Batasan Anggaran</h3>
                <p class="text-xs text-slate-400">Atur batasan belanja per kategori untuk mendisiplinkan pengeluaran Anda</p>
            </div>
            <div id="budget-list" class="space-y-4"></div>
        \`;
        container.appendChild(card);

        const list = card.querySelector('#budget-list');
        const budgets = state.summaryData?.budgetSummary || [];

        if (budgets.length === 0) {
            list.innerHTML = \`<div class="p-6 bg-slate-50 border border-slate-150 rounded-xl text-center">
                <p class="text-sm text-slate-400">Belum ada data anggaran di periode ini.</p>
            </div>\`;
            return;
        }

        budgets.forEach(b => {
            const isOver = b.status === 'overbudget';
            const pct = Math.min(b.usagePercentage, 100);
            const colorClass = isOver ? 'bg-rose-500' : 'bg-primary-500';
            
            const bCard = document.createElement('div');
            bCard.className = "p-4 border border-slate-100 rounded-xl space-y-3 bg-white shadow-sm";
            bCard.innerHTML = \`
                <div class="flex items-center justify-between">
                    <div>
                        <h4 class="font-bold text-slate-700 text-sm flex items-center gap-2">
                            <span class="p-1 bg-slate-50 rounded text-base">📦</span>
                            \${b.category}
                        </h4>
                        <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">\${isOver ? 'Overbudget!' : 'Sisa Rp ' + Math.round(b.remainingAmount).toLocaleString('id-ID')}</span>
                    </div>
                    <div class="px-2.5 py-1 \${isOver ? 'bg-rose-50 text-rose-700' : 'bg-primary-50 text-primary-700'} rounded-xl text-xs font-bold font-mono-jb">\${b.usagePercentage}%</div>
                </div>
                <div class="space-y-1.5">
                    <div class="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full \${colorClass} rounded-full" style="width: \${pct}%"></div>
                    </div>
                    <div class="flex justify-between text-xs font-semibold text-slate-500 pt-1">
                        <span>Terpakai: Rp \${Math.round(b.spentAmount).toLocaleString('id-ID')}</span>
                        <span>Anggaran: Rp \${Math.round(b.budgetAmount).toLocaleString('id-ID')}</span>
                    </div>
                </div>
            \`;
            list.appendChild(bCard);
        });
    }`;

html = html.replace(regex, newContent);
fs.writeFileSync('public/index.html', html);
