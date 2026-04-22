import { useState } from 'react';
import { AppState, MoneyEntry } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function MoneyTab({ state, setState }: { state: AppState, setState: (v: any) => void }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addExpense = () => {
    if (!title || !amount) return;

    const newExpense: MoneyEntry = {
      id: Date.now().toString(),
      title,
      amount: parseInt(amount, 10),
      date: new Date().toISOString()
    };

    setState((prev: AppState) => ({
      ...prev,
      money: [newExpense, ...prev.money]
    }));
    setTitle('');
    setAmount('');
    setIsAdding(false);
  };

  const deleteExpense = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      money: prev.money.filter(m => m.id !== id)
    }));
  };

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = daysInMonth - today.getDate() + 1; // Includes today

  const safeMoney = state.money || [];
  const thisMonthExpenses = safeMoney.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const spentThisMonth = thisMonthExpenses.reduce((acc, m) => acc + m.amount, 0);
  const progressPercent = Math.min((spentThisMonth / (state.budget || 1)) * 100, 100);
  
  const remaining = Math.max((state.budget || 0) - spentThisMonth, 0);
  const dailyAverage = daysRemaining > 0 ? Math.round(remaining / daysRemaining) : remaining;

  return (
    <div className="pt-2 pb-6 space-y-6">
      {/* Progress Card */}
      <div className="glass-panel p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
        {/* Spatial glowing background blob */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-[50px] pointer-events-none" />

        <h2 className="m-0 mb-4 text-[18px] font-bold relative z-10">Сводка за месяц</h2>

        <div className="flex justify-between items-center mb-2 font-medium text-sm relative z-10">
          <span className="text-[var(--color-text-dim)]">Бюджет:</span>
          <span>
            {spentThisMonth.toLocaleString('ru-RU')} ₽ <span className="text-[var(--color-text-dim)]">/ {(state.budget || 0).toLocaleString('ru-RU')} ₽</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-[8px] w-full bg-black/40 rounded-full overflow-hidden relative z-10 shadow-inner">
          <div 
            className="h-full bg-accent neon-glow rounded-full fluid-trans ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between mt-5 mb-8 bg-black/20 p-4 rounded-[16px] border border-white/5 relative z-10">
          <div>
            <p className="text-[var(--color-text-dim)] text-[11px] uppercase tracking-wider font-bold mb-1 m-0">Остаток</p>
            <p className="font-bold text-lg m-0 text-white truncate max-w-[120px]">{remaining.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="text-right">
            <p className="text-[var(--color-text-dim)] text-[11px] uppercase tracking-wider font-bold mb-1 m-0">Доступно на сегодня</p>
            <p className="font-bold text-lg m-0 text-white truncate max-w-[120px]">{dailyAverage.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Расходы <span className="bg-accent neon-glow text-[#0A0A0A] px-2 py-0.5 rounded-full text-xs font-bold fluid-trans">{thisMonthExpenses.length}</span>
          </h3>
          <div className="flex flex-col">
            {thisMonthExpenses.length === 0 && <p className="text-[var(--color-text-dim)] text-sm m-0 py-2">Пока ничего не добавлено.</p>}
            {thisMonthExpenses.map(m => (
              <div key={m.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group">
                <span className="text-[15px]">{m.title}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-medium text-[var(--color-text-dim)]">-{m.amount.toLocaleString('ru-RU')} ₽</span>
                  <button onClick={() => deleteExpense(m.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-red-500/80 hover:text-red-500 bg-transparent border-none p-1 cursor-pointer fluid-trans transition-opacity active:scale-90">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full mt-6 py-4 glass-panel border border-white/10 text-white font-semibold flex items-center justify-center gap-2 rounded-[20px] cursor-pointer active:scale-95 fluid-trans shadow-lg relative z-10 hover:bg-white/5"
          >
            + Добавить расход
          </button>
        ) : (
          <div className="glass-panel p-5 rounded-[24px] mt-6 space-y-3 relative z-20">
            <input 
              type="text" 
              placeholder="На что?" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
              autoFocus
            />
            <input 
              type="number" 
              placeholder="Сумма (₽)" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
            />
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsAdding(false)} className="w-1/2 py-4 border-none bg-transparent text-[var(--color-text-dim)] cursor-pointer hover:text-white fluid-trans">Отмена</button>
              <button onClick={addExpense} className="w-1/2 py-4 bg-accent neon-glow text-[#0A0A0A] border-none font-bold rounded-[16px] cursor-pointer active:scale-95 shadow-lg fluid-trans">Сохранить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
