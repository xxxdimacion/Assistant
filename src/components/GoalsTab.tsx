import { useState } from 'react';
import { AppState, GoalSource } from '../types';
import { Plus, Edit2 } from 'lucide-react';
import { motion } from 'motion/react';

type GoalType = 'income' | 'subscribers' | 'views' | 'salesTraff';
type Timeframe = 'year' | 'may';
type ModalConfig = { type: GoalType, timeframe: Timeframe };

export default function GoalsTab({ state, setState }: { state: AppState, setState: (v: any) => void }) {
  const [activeModal, setActiveModal] = useState<ModalConfig | null>(null);
  const [editTargetModal, setEditTargetModal] = useState<ModalConfig | null>(null);

  // Fallbacks for older cached state
  const goalsMay = state.goalsMay || {
    income: { target: 50000, current: 0 },
    subscribers: { target: 5000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0, 'TikTok ADS': 0, 'Meta ADS': 0 } },
    views: { target: 500000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0, 'TikTok ADS': 0, 'Meta ADS': 0 } },
    salesTraff: { target: 50, current: 0 }
  };
  
  const goalsYear = state.goals;

  return (
    <div className="pt-2 pb-6 space-y-8">
      {/* --- МАЙ --- */}
      <div className="glass-panel rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
        {/* Spatial glowing background blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[60px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

        <h2 className="m-0 mb-5 text-xl font-bold flex items-center relative z-10">Май</h2>
        
        <div className="flex flex-col gap-4 relative z-10">
          <GoalCard 
            title="Доход" 
            target={goalsMay.income.target} 
            current={goalsMay.income.current} 
            suffix="₽"
            onAdd={() => setActiveModal({type: 'income', timeframe: 'may'})}
            onEditTarget={() => setEditTargetModal({type: 'income', timeframe: 'may'})}
          />

          <GoalCard 
            title="Подписчики в канал" 
            target={goalsMay.subscribers.target} 
            current={goalsMay.subscribers.current} 
            suffix="чел."
            sources={goalsMay.subscribers.sources}
            onAdd={() => setActiveModal({type: 'subscribers', timeframe: 'may'})}
            onEditTarget={() => setEditTargetModal({type: 'subscribers', timeframe: 'may'})}
          />

          <GoalCard 
            title="Просмотры видео" 
            target={goalsMay.views.target} 
            current={goalsMay.views.current} 
            suffix="просм."
            sources={goalsMay.views.sources}
            onAdd={() => setActiveModal({type: 'views', timeframe: 'may'})}
            onEditTarget={() => setEditTargetModal({type: 'views', timeframe: 'may'})}
          />

          <GoalCard 
            title="Продажи TRAFF" 
            target={goalsMay.salesTraff.target} 
            current={goalsMay.salesTraff.current} 
            onAdd={() => setActiveModal({type: 'salesTraff', timeframe: 'may'})}
            onEditTarget={() => setEditTargetModal({type: 'salesTraff', timeframe: 'may'})}
          />
        </div>
      </div>

      {/* --- ЦЕЛИ 2026 --- */}
      <div className="glass-panel rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
        {/* Spatial glowing background blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[60px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

        <h2 className="m-0 mb-5 text-xl font-bold flex items-center relative z-10">Цели 2026</h2>
        
        <div className="flex flex-col gap-4 relative z-10">
          <GoalCard 
            title="Доход" 
            target={goalsYear.income.target} 
            current={goalsYear.income.current} 
            suffix="₽"
            onAdd={() => setActiveModal({type: 'income', timeframe: 'year'})}
            onEditTarget={() => setEditTargetModal({type: 'income', timeframe: 'year'})}
          />

          <GoalCard 
            title="Подписчики в канал" 
            target={goalsYear.subscribers.target} 
            current={goalsYear.subscribers.current} 
            suffix="чел."
            sources={goalsYear.subscribers.sources}
            onAdd={() => setActiveModal({type: 'subscribers', timeframe: 'year'})}
            onEditTarget={() => setEditTargetModal({type: 'subscribers', timeframe: 'year'})}
          />

          <GoalCard 
            title="Просмотры видео" 
            target={goalsYear.views.target} 
            current={goalsYear.views.current} 
            suffix="просм."
            sources={goalsYear.views.sources}
            onAdd={() => setActiveModal({type: 'views', timeframe: 'year'})}
            onEditTarget={() => setEditTargetModal({type: 'views', timeframe: 'year'})}
          />
        </div>
      </div>

      {activeModal && (
        <GoalAddModal 
          config={activeModal} 
          state={state} 
          setState={setState} 
          onClose={() => setActiveModal(null)} 
        />
      )}

      {editTargetModal && (
        <GoalEditTargetModal 
          config={editTargetModal} 
          state={state} 
          setState={setState} 
          onClose={() => setEditTargetModal(null)} 
        />
      )}
    </div>
  );
}

function GoalCard({ title, target, current, suffix = "", sources, onAdd, onEditTarget }: { title: string, target: number, current: number, suffix?: string, sources?: Record<string, number>, onAdd: () => void, onEditTarget: () => void }) {
  const pct = Math.min((current / target) * 100, 100) || 0;

  return (
    <div className="bg-black/20 p-5 rounded-[24px] border border-white/5 fluid-trans hover:border-white/10 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 className="text-base m-0 text-white font-bold">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[var(--color-text-dim)] text-xs m-0">Цель: {target.toLocaleString('ru-RU')}{suffix ? ` ${suffix}` : ''}</p>
            <button onClick={onEditTarget} className="bg-transparent border-none p-1 text-[var(--color-text-dim)] hover:text-white cursor-pointer active:scale-90 fluid-trans">
              <Edit2 size={12} />
            </button>
          </div>
        </div>
        <div className="text-lg font-bold text-white drop-shadow-sm flex items-center">
          {current.toLocaleString('ru-RU')}
          <button onClick={onAdd} className="ml-2 w-7 h-7 rounded-full bg-accent text-[#0A0A0A] flex items-center justify-center cursor-pointer active:scale-90 border-none fluid-trans shadow-md neon-glow">
            <Plus size={14} strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="h-[8px] w-full bg-[#121212] rounded-full overflow-hidden my-3 relative z-10 shadow-inner">
        <motion.div 
          className="h-full bg-accent neon-glow rounded-full ease-out" 
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', bounce: 0, duration: 0.8 }}
        />
      </div>

      {sources && (
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs border-t border-white/10 pt-4 relative z-10">
           {Object.entries(sources).filter(([_, val]) => val > 0).map(([source, val]) => (
             <div key={source} className="flex gap-1 justify-between pr-2">
               <span className="text-[var(--color-text-dim)]">{source}:</span>
               <span className="text-white font-medium">{val.toLocaleString('ru-RU')}</span>
             </div>
           ))}
           {Object.values(sources).every(v => v === 0) && (
             <p className="text-[var(--color-text-dim)] text-xs col-span-2 m-0">Нет данных</p>
           )}
        </div>
      )}
    </div>
  );
}

function GoalAddModal({ config, state, setState, onClose }: { config: ModalConfig, state: AppState, setState: (v: any) => void, onClose: () => void }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<GoalSource>('Threads');

  const { type, timeframe } = config;

  const handleSave = () => {
    const val = parseInt(amount, 10);
    if (!val || isNaN(val)) return;

    setState((prev: AppState) => {
      const stateObj = { ...prev };
      const key = timeframe === 'may' ? 'goalsMay' : 'goals';
      
      const targetGroup = stateObj[key] ? JSON.parse(JSON.stringify(stateObj[key])) : {
        income: { target: 50000, current: 0 },
        subscribers: { target: 5000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0, 'TikTok ADS': 0, 'Meta ADS': 0 } },
        views: { target: 500000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0, 'TikTok ADS': 0, 'Meta ADS': 0 } },
        salesTraff: { target: 50, current: 0 }
      };

      if (!targetGroup.salesTraff) {
        targetGroup.salesTraff = { target: timeframe === 'may' ? 50 : 100, current: 0 };
      }

      if (type === 'income' || type === 'salesTraff') {
        targetGroup[type] = {
          ...targetGroup[type],
          current: targetGroup[type].current + val
        };
      } else {
        targetGroup[type] = {
          ...targetGroup[type],
          current: targetGroup[type].current + val,
          sources: {
            ...targetGroup[type].sources,
            [source]: (targetGroup[type].sources?.[source] || 0) + val
          }
        };
      }

      stateObj[key] = targetGroup;
      return stateObj;
    });
    onClose();
  };

  const sourcesList: GoalSource[] = ['Threads', 'YouTube Shorts', 'Reels', 'TikTok', 'TikTok ADS', 'Meta ADS'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0A0A0A]/40 backdrop-blur-md">
      <div className="glass-panel p-6 rounded-[32px] w-full max-w-sm shadow-2xl space-y-4 relative">
        <h3 className="text-xl m-0 font-bold text-white">Добавить прогресс</h3>
        
        {(type === 'subscribers' || type === 'views') && (
          <div className="space-y-1">
            <label className="text-xs text-[var(--color-text-dim)]">Источник трафика</label>
            <select 
              value={source} 
              onChange={e => setSource(e.target.value as GoalSource)}
              className="w-full bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans appearance-none"
            >
              {sourcesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-dim)]">Количество</label>
          <input 
            type="number" 
             value={amount}
             onChange={e => setAmount(e.target.value)}
             onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            className="w-full bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
            autoFocus
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="w-1/2 py-4 border-none bg-transparent text-[var(--color-text-dim)] hover:text-white cursor-pointer fluid-trans">Отмена</button>
          <button onClick={handleSave} className="w-1/2 py-4 bg-accent neon-glow text-[#0A0A0A] border-none font-bold rounded-[16px] cursor-pointer active:scale-95 shadow-lg fluid-trans">Сохранить</button>
        </div>
      </div>
    </div>
  );
}

function GoalEditTargetModal({ config, state, setState, onClose }: { config: ModalConfig, state: AppState, setState: (v: any) => void, onClose: () => void }) {
  const { type, timeframe } = config;
  const key = timeframe === 'may' ? 'goalsMay' : 'goals';
  const targetGroup = state[key] || state.goals;
  
  // Safe fallback to prevent crashes if salesTraff wasn't initialized in old state
  const currentTarget = targetGroup[type]?.target || 0;
  
  const [targetVal, setTargetVal] = useState(currentTarget.toString());

  const handleSave = () => {
    const val = parseInt(targetVal, 10);
    if (!val || isNaN(val)) return;

    setState((prev: AppState) => {
      const stateObj = { ...prev };
      
      const updatedGroup = stateObj[key] ? JSON.parse(JSON.stringify(stateObj[key])) : {
        income: { target: 50000, current: 0 },
        subscribers: { target: 5000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0 } },
        views: { target: 500000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0 } },
        salesTraff: { target: 50, current: 0 }
      };

      if (!updatedGroup.salesTraff) {
        updatedGroup.salesTraff = { target: timeframe === 'may' ? 50 : 100, current: 0 };
      }

      updatedGroup[type].target = val;
      stateObj[key] = updatedGroup;
      
      return stateObj;
    });
    onClose();
  };

  const titles = {
    income: 'Цель: Доход',
    subscribers: 'Цель: Подписчики',
    views: 'Цель: Просмотры',
    salesTraff: 'Цель: Продажи TRAFF'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#0A0A0A]/40 backdrop-blur-md">
      <div className="glass-panel p-6 rounded-[32px] w-full max-w-sm shadow-2xl space-y-4 relative">
        <h3 className="text-xl m-0 font-bold text-white">{titles[type]}</h3>

        <div className="space-y-1">
          <label className="text-xs text-[var(--color-text-dim)]">Новое значение цели</label>
          <input 
            type="number" 
             value={targetVal}
             onChange={e => setTargetVal(e.target.value)}
             onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
            className="w-full bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
            autoFocus
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="w-1/2 py-4 border-none bg-transparent text-[var(--color-text-dim)] hover:text-white cursor-pointer fluid-trans">Отмена</button>
          <button onClick={handleSave} className="w-1/2 py-4 bg-accent neon-glow text-[#0A0A0A] border-none font-bold rounded-[16px] cursor-pointer active:scale-95 shadow-lg fluid-trans">Изменить</button>
        </div>
      </div>
    </div>
  );
}
