const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const renderTxRegex = /function renderTransactions\(container\) \{[\s\S]*?function filterTransactionsTable\(\) \{[\s\S]*?tbody\.appendChild\(tr\);\s*\}\);\s*\}/;

const newRenderTx = `function renderTransactions(container) {
        const card = document.createElement('div');
        card.className = "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm";
        card.innerHTML = \`
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-800">Daftar Transaksi</h3>
                    <p class="text-xs text-slate-400">Telusuri riwayat transaksi keuangan Anda</p>
                </div>
            </div>
            <!-- Table Wrapper -->
            <div class="overflow-x-auto border border-slate-100 rounded-xl">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50/75 border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                            <th class="py-3 px-4">Tanggal</th>
                            <th class="py-3 px-4">Keterangan</th>
                            <th class="py-3 px-4">Tipe</th>
                            <th class="py-3 px-4">Kategori</th>
                            <th class="py-3 px-4">Dompet</th>
                            <th class="py-3 px-4 text-right">Jumlah (Rp)</th>
                        </tr>
                    </thead>
                    <tbody id="txs-table-body" class="divide-y divide-slate-100 text-sm">
                        <!-- Loaded dynamically -->
                    </tbody>
                </table>
            </div>
        \`;
        container.appendChild(card);
        renderTransactionsTable();
    }

    function renderTransactionsTable() {
        const tbody = document.getElementById('txs-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!state.transactions || state.transactions.length === 0) {
            tbody.innerHTML = \`<tr><td colspan="6" class="text-center py-6 text-slate-400 text-xs">Belum ada transaksi di bulan ini</td></tr>\`;
            return;
        }

        state.transactions.forEach((tx) => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50/50 transition";
            
            const isIncome = tx.cashflow === 'income';
            const isTransfer = tx.cashflow === 'transfer';
            const flowBg = isIncome ? 'bg-emerald-50 text-emerald-700' : isTransfer ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700';
            const flowLabel = isIncome ? 'Masuk' : isTransfer ? 'Transfer' : 'Keluar';

            tr.innerHTML = \`
                <td class="py-3.5 px-4 text-xs font-mono-jb text-slate-400">\${new Date(tx.transactionDate).toLocaleDateString('id-ID')}</td>
                <td class="py-3.5 px-4 font-semibold text-slate-700">\${tx.description || '-'}</td>
                <td class="py-3.5 px-4">
                    <span class="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider \${flowBg}">\${flowLabel}</span>
                </td>
                <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        \${tx.category || '-'}
                    </span>
                </td>
                <td class="py-3.5 px-4 text-xs font-semibold text-slate-600">\${tx.wallet || '-'}</td>
                <td class="py-3.5 px-4 text-right font-mono-jb font-bold \${isIncome ? 'text-emerald-500' : 'text-slate-700'}">
                    \${isIncome ? '+' : (isTransfer ? '' : '-')}\${Math.round(tx.amount).toLocaleString('id-ID')}
                </td>
            \`;
            tbody.appendChild(tr);
        });
    }`;

html = html.replace(renderTxRegex, newRenderTx);
fs.writeFileSync('public/index.html', html);
