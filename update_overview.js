const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// Replace the budget progress populator
const budgetPopRegex = /\/\/ Upcoming Bills List Box/;
const budgetPopLogic = `        
        const bgtList = bProgressCard.querySelector('#overview-budget-list');
        const overviewBudgets = state.summaryData.budgetSummary || [];
        if (overviewBudgets.length > 0) {
            bgtList.innerHTML = '';
            overviewBudgets.slice(0, 3).forEach(b => {
                const isOver = b.status === 'overbudget';
                const pct = Math.min(b.usagePercentage, 100);
                const barColor = isOver ? 'bg-rose-500' : 'bg-primary-500';
                const el = document.createElement('div');
                el.innerHTML = \`
                    <div class="flex justify-between text-xs mb-1.5 font-semibold">
                        <span class="text-slate-600">\${b.category}</span>
                        <span class="\${isOver ? 'text-rose-600' : 'text-slate-600'} font-mono-jb">\${b.usagePercentage}%</span>
                    </div>
                    <div class="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div class="h-full \${barColor} rounded-full" style="width: \${pct}%"></div>
                    </div>
                \`;
                bgtList.appendChild(el);
            });
        }

        // Upcoming Bills List Box`;

html = html.replace(budgetPopRegex, budgetPopLogic);

// Replace the transaction populator in overview
const txPopRegex = /\/\/ Populate Recent Transactions[\s\S]*?\/\/ Populate Unpaid Bills/;
const txPopLogic = `// Populate Recent Transactions
        const txList = txCard.querySelector('#overview-txs-list');
        const recentTxs = state.summaryData.recentTransactions || [];
        if (recentTxs.length === 0) {
            txList.innerHTML = \`<div class="py-8 text-center"><p class="text-xs text-slate-400">Belum ada transaksi bulan ini</p></div>\`;
        } else {
            recentTxs.slice(0, 5).forEach((tx) => {
                const item = document.createElement('div');
                item.className = "flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-100 group";
                
                const isIncome = tx.cashflow === 'income';
                const isTransfer = tx.cashflow === 'transfer';
                
                const iconBg = isIncome ? 'bg-emerald-100 text-emerald-600' : isTransfer ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600';
                const iconType = isIncome ? 'arrow-down-left' : isTransfer ? 'arrow-right-left' : 'arrow-up-right';
                const sign = isIncome ? '+' : isTransfer ? '' : '-';
                const valColor = isIncome ? 'text-emerald-600' : isTransfer ? 'text-slate-700' : 'text-slate-800';

                item.innerHTML = \`
                    <div class="flex items-center gap-3">
                        <div class="p-2.5 rounded-xl \${iconBg} group-hover:scale-110 transition-transform"><i data-lucide="\${iconType}" class="w-4 h-4"></i></div>
                        <div>
                            <p class="text-sm font-bold text-slate-700">\${tx.description || '-'}</p>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">\${new Date(tx.transactionDate).toLocaleDateString('id-ID')} • \${tx.category || '-'}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-bold font-mono-jb \${valColor}">\${sign} Rp \${Math.round(tx.amount).toLocaleString('id-ID')}</p>
                    </div>
                \`;
                txList.appendChild(item);
            });
        }

        // Populate Unpaid Bills`;

html = html.replace(txPopRegex, txPopLogic);
fs.writeFileSync('public/index.html', html);
