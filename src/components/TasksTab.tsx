import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, Trash2, CalendarIcon, Circle } from 'lucide-react';
import { AppState, Task } from '../types';

export default function TasksTab({ state, setState }: { state: AppState, setState: (v: any) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<'red' | 'orange' | 'green'>('green');

  const addTask = () => {
    if (!note.trim() || !deadline.trim()) return;
    
    // Auto-format deadline if it's not strictly DD.MM.YYYY but close
    let finalDeadline = deadline;
    if (deadline.includes('-') && deadline.length === 10) {
      // YYYY-MM-DD to DD.MM.YYYY
      const [y, m, d] = deadline.split('-');
      finalDeadline = `${d}.${m}.${y}`;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      note,
      deadline: finalDeadline,
      completed: false,
      priority
    };

    setState((prev: AppState) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));
    setNote('');
    setDeadline('');
    setPriority('green');
    setIsAdding(false);
  };

  const removeTask = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const completeTask = (id: string) => {
    setState((prev: AppState) => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: true } : t)
    }));
  };

  const getPriorityColor = (p?: 'red' | 'orange' | 'green') => {
    if (p === 'red') return 'bg-red-500';
    if (p === 'orange') return 'bg-orange-500';
    return 'bg-green-500'; // Default is green
  };

  const parseDate = (dStr: string) => {
    const parts = dStr.split('.');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
    }
    return Infinity;
  };

  const safeTasks = state.tasks || [];
  const sortedTasks = [...safeTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    const dateA = parseDate(a.deadline);
    const dateB = parseDate(b.deadline);
    if (dateA !== dateB) return dateA - dateB;

    const priorityWeight: Record<string, number> = { red: 3, orange: 2, green: 1 };
    return (priorityWeight[b.priority || 'green'] || 1) - (priorityWeight[a.priority || 'green'] || 1);
  });

  return (
    <div className="pt-2 pb-6 relative space-y-4">
      <div className="glass-panel rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
        {/* Spatial glowing background blob */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-[50px] pointer-events-none" />

        <h2 className="m-0 mb-6 text-xl font-bold flex items-center gap-3 relative z-10">
          Задачи 
          <span className="bg-accent neon-glow text-[#0A0A0A] px-2 py-0.5 rounded-full text-xs font-bold fluid-trans">
            {safeTasks.filter(t => !t.completed).length}
          </span>
        </h2>
        
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {sortedTasks.map(task => (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`relative overflow-hidden ${task.completed ? 'opacity-50' : ''}`}
              >
                {/* Background elements for swipe feedback */}
                <div className="absolute inset-0 flex border-b border-white/5">
                  <div className="flex-1 bg-[#221010] flex items-center px-4">
                    <Trash2 className="text-red-500" size={18} />
                  </div>
                  <div className="flex-1 bg-[#102213] flex items-center justify-end px-4">
                    <Check className="text-green-500" size={18} />
                  </div>
                </div>

                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.8}
                  onDragEnd={(e, info) => {
                    if (info.offset.x > 100) {
                      completeTask(task.id);
                    } else if (info.offset.x < -100) {
                      removeTask(task.id);
                    }
                  }}
                  className="bg-[#121214] py-4 relative z-10 flex border-b border-white/5 fluid-trans items-stretch"
                >
                  <div className={`w-1 rounded-full mr-4 shrink-0 ${getPriorityColor(task.priority)} ${task.completed ? 'opacity-30' : ''}`} />
                  <div className="flex flex-col gap-1 w-full relative right-2">
                    <p className={`text-[15px] leading-snug m-0 fluid-trans ${task.completed ? 'line-through text-[var(--color-text-dim)]' : 'text-white'}`}>
                      {task.note}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium mt-1">
                      <span className="text-[var(--color-text-dim)]">Дедлайн:</span>
                      <span className={`fluid-trans ${task.completed ? 'text-[var(--color-text-dim)]' : 'text-accent drop-shadow-[0_0_4px_rgba(255,94,0,0.3)]'}`}>{task.deadline}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {safeTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-6 text-[var(--color-text-dim)]">
              <p className="m-0">Нет задач</p>
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full mt-6 py-4 glass-panel text-white font-semibold text-base rounded-[20px] shadow-lg cursor-pointer active:scale-95 fluid-trans hover:bg-white/5 border border-white/10"
          >
            + Новая задача
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full glass-panel p-5 rounded-[24px] shadow-2xl mt-5 flex flex-col gap-4 relative z-20"
          >
            <input 
              type="text" 
              placeholder="Что нужно сделать?" 
              value={note}
              onChange={e => setNote(e.target.value)}
              className="bg-black/40 text-white px-4 py-4 rounded-[16px] border border-white/10 outline-none focus:border-accent/50 fluid-trans placeholder-white/30"
              autoFocus
            />

            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider font-bold">Приоритет (Блок)</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPriority('red')} 
                  className={`w-10 h-10 rounded-full bg-red-500 fluid-trans border-[3px] border-[#161616] ${priority === 'red' ? 'ring-2 ring-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'opacity-40'}`} 
                />
                <button 
                  onClick={() => setPriority('orange')} 
                  className={`w-10 h-10 rounded-full bg-orange-500 fluid-trans border-[3px] border-[#161616] ${priority === 'orange' ? 'ring-2 ring-orange-500 scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'opacity-40'}`} 
                />
                <button 
                  onClick={() => setPriority('green')} 
                  className={`w-10 h-10 rounded-full bg-green-500 fluid-trans border-[3px] border-[#161616] ${priority === 'green' ? 'ring-2 ring-green-500 scale-110 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'opacity-40'}`} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-1">
              <label className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider font-bold">Срок выполнения</label>
              
              {/* Quick Picks */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setDeadline(new Date().toISOString().split('T')[0])}
                  className="bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer fluid-trans hover:bg-white/10 active:scale-95"
                >
                  Сегодня
                </button>
                <button 
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setDeadline(d.toISOString().split('T')[0]);
                  }}
                  className="bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer fluid-trans hover:bg-white/10 active:scale-95"
                >
                  Завтра
                </button>
                <button 
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 7);
                    setDeadline(d.toISOString().split('T')[0]);
                  }}
                  className="bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer fluid-trans hover:bg-white/10 active:scale-95"
                >
                  Неделя
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <input 
                  type="date" 
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="bg-black/40 text-white px-4 py-3.5 rounded-[16px] border border-white/10 outline-none w-full focus:border-accent/50 fluid-trans placeholder-white/30"
                  lang="ru-RU"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => setIsAdding(false)}
                className="bg-white/5 text-[var(--color-text-dim)] font-medium rounded-[16px] py-3.5 w-1/3 border border-white/5 cursor-pointer hover:text-white hover:bg-white/10 fluid-trans"
              >
                Отмена
              </button>
              <button 
                onClick={addTask}
                className="bg-accent neon-glow text-[#0A0A0A] font-bold rounded-[16px] py-3.5 w-2/3 border-none active:scale-95 fluid-trans shadow-lg"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
