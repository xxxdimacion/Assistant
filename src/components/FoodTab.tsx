import { useState, useMemo } from 'react';
import { AppState, FoodEntry } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function FoodTab({ state, setState }: { state: AppState, setState: (v: any) => void }) {
  const [title, setTitle] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [isAdding, setIsAdding] = useState(false);

  const addFood = () => {
    if (!title || !kcal) return;

    const selectedDate = new Date(dateInput);
    if (isNaN(selectedDate.getTime())) return;

    const newFood: FoodEntry = {
      id: Date.now().toString(),
      title,
      kcal: parseInt(kcal, 10),
      protein: protein ? parseInt(protein, 10) : undefined,
      date: selectedDate.toISOString()
    };

    setState((prev: AppState) => ({
      ...prev,
      food: [newFood, ...prev.food]
    }));
    setTitle('');
    setKcal('');
    setProtein('');
    setIsAdding(false);
  };

  const deleteFood = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      food: prev.food.filter(f => f.id !== id)
    }));
  };

  const todayStr = new Date().toDateString();
  const todayFood = state.food.filter(f => new Date(f.date).toDateString() === todayStr);
  const sumTodayKcal = todayFood.reduce((acc, f) => acc + f.kcal, 0);
  const sumTodayProtein = todayFood.reduce((acc, f) => acc + (f.protein || 0), 0);

  // Avg 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const last7DaysFood = state.food.filter(f => new Date(f.date) >= sevenDaysAgo);
  const sum7Days = last7DaysFood.reduce((acc, f) => acc + f.kcal, 0);
  const sum7DaysProtein = last7DaysFood.reduce((acc, f) => acc + (f.protein || 0), 0);
  const uniqueDays = new Set(last7DaysFood.map(f => new Date(f.date).toDateString())).size;
  const avg7Days = uniqueDays === 0 ? 0 : Math.round(sum7Days / uniqueDays);
  const avg7DaysProtein = uniqueDays === 0 ? 0 : Math.round(sum7DaysProtein / uniqueDays);

  const groupedFood = useMemo(() => {
    const groups: Record<string, FoodEntry[]> = {};
    const sorted = [...state.food].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    sorted.forEach(item => {
      const d = new Date(item.date);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const dateKey = `${day}.${month}.${d.getFullYear()}`;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return groups;
  }, [state.food]);

  return (
    <div className="pt-2 pb-6 space-y-6">
      <div className="glass-panel p-6 rounded-[32px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-40 h-40 bg-accent/10 rounded-full blur-[50px] pointer-events-none transform -translate-y-1/2" />

        <h2 className="m-0 mb-4 text-[18px] font-bold relative z-10">Сводка (Сегодня)</h2>

        <div className="flex flex-col gap-2 mb-1 font-medium text-sm relative z-10">
          <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
            <span className="text-[var(--color-text-dim)]">Калории:</span>
            <span><span className="font-bold text-lg text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">{sumTodayKcal}</span> ккал</span>
          </div>
          <div className="flex justify-between items-center bg-black/20 p-3 rounded-2xl border border-white/5">
            <span className="text-[var(--color-text-dim)]">Белок:</span>
            <span><span className="font-bold text-lg text-white">{sumTodayProtein}</span> г</span>
          </div>
        </div>
        <p className="text-[var(--color-text-dim)] text-[12px] m-0 mb-6 relative z-10 pl-2">Среднее за 7 дней: {avg7Days} ккал | {avg7DaysProtein} г белка</p>

        <div className="relative z-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            История питания <span className="bg-accent neon-glow text-[#0A0A0A] px-2 py-0.5 rounded-full text-xs font-bold">{state.food.length}</span>
          </h3>
          <div className="flex flex-col gap-4">
            {Object.keys(groupedFood).length === 0 && <p className="text-[var(--color-text-dim)] text-sm m-0 py-2">Пока ничего не добавлено.</p>}
            
            {Object.entries(groupedFood).map(([dateKey, items]) => (
              <div key={dateKey} className="flex flex-col border border-white/5 bg-black/20 rounded-[16px] overflow-hidden">
                <div className="bg-white/5 px-4 py-2 text-xs font-bold text-[var(--color-text-dim)]">
                  {dateKey}
                </div>
                <div>
                  {(items as FoodEntry[]).map((f, i) => (
                    <div key={f.id} className={`flex justify-between items-center px-4 py-3 group ${i !== (items as FoodEntry[]).length - 1 ? 'border-b border-white/5' : ''}`}>
                      <div className="flex flex-col">
                        <span className="text-[15px]">{f.title}</span>
                        {f.protein ? <span className="text-xs text-[var(--color-text-dim)]">{f.protein} г белка</span> : null}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[15px] font-medium text-accent">{f.kcal} ккал</span>
                        <button onClick={() => deleteFood(f.id)} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-red-500/80 hover:text-red-500 bg-transparent border-none p-1 cursor-pointer fluid-trans transition-opacity active:scale-90">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full mt-6 py-4 glass-panel border-none text-white font-semibold flex items-center justify-center gap-2 rounded-[20px] cursor-pointer active:scale-95 fluid-trans shadow-lg relative z-10 hover:bg-white/5"
          >
            + Записать прием пищи
          </button>
        ) : (
          <div className="glass-panel p-5 rounded-[24px] mt-6 space-y-3 relative z-20">
            <input 
              type="text" 
              placeholder="Что ели?" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
              autoFocus
            />
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Ккал" 
                value={kcal}
                onChange={e => setKcal(e.target.value)}
                className="w-1/3 bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
              />
              <input 
                type="number" 
                placeholder="Белок (г)" 
                value={protein}
                onChange={e => setProtein(e.target.value)}
                className="w-1/3 bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
              />
               <input 
                type="date" 
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="w-1/3 bg-black/40 text-[var(--color-text-dim)] px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans max-h-[56px]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setIsAdding(false)} className="w-1/2 py-3 border-none bg-transparent text-[var(--color-text-dim)] cursor-pointer hover:text-white fluid-trans">Отмена</button>
              <button onClick={addFood} className="w-1/2 py-3 bg-accent neon-glow text-[#0A0A0A] border-none font-bold rounded-[16px] cursor-pointer active:scale-95 shadow-lg fluid-trans">Сохранить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
