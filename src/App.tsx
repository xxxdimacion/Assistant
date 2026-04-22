import { useState, useEffect, ReactNode } from 'react';
import { Settings, LayoutGrid, Coffee, Wallet, Activity } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppState, GoalSource } from './types';
import TasksTab from './components/TasksTab';
import FoodTab from './components/FoodTab';
import MoneyTab from './components/MoneyTab';
import GoalsTab from './components/GoalsTab';
import SettingsModal from './components/SettingsModal';

const INITIAL_STATE: AppState = {
  tasks: [],
  food: [],
  budget: 50000,
  money: [],
  goals: {
    income: { target: 100000, current: 0 },
    subscribers: { target: 10000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0, 'TikTok ADS': 0, 'Meta ADS': 0 } },
    salesTraff: { target: 100, current: 0 }
  },
  goalsMay: {
    income: { target: 50000, current: 0 },
    subscribers: { target: 5000, current: 0, sources: { 'Threads': 0, 'YouTube Shorts': 0, 'Reels': 0, 'TikTok': 0, 'TikTok ADS': 0, 'Meta ADS': 0 } },
    salesTraff: { target: 50, current: 0 }
  },
  settings: {
    tgToken: '',
    tgChatId: ''
  }
};

export default function App() {
  const [state, setState] = useLocalStorage<AppState>('assistant_data_v2', INITIAL_STATE);
  const [activeTab, setActiveTab] = useState<'tasks' | 'food' | 'money' | 'goals'>('tasks');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const dateObj = new Date();
  const daysArr = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const monthsArr = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'];
  const todayFormatted = `${daysArr[dateObj.getDay()]}, ${dateObj.getDate()} ${monthsArr[dateObj.getMonth()]}`;

  // Telegram Deadline Checker
  useEffect(() => {
    if (!state.settings.tgToken || !state.settings.tgChatId) return;

    const checkDeadlines = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tasksToNotify = state.tasks.filter(t => !t.completed && !t.tgSent);
      
      let updated = false;
      const newTasks = [...state.tasks];

      for (let i = 0; i < newTasks.length; i++) {
        const task = newTasks[i];
        if (task.completed || task.tgSent) continue;

        // Parse DD.MM.YYYY
        const parts = task.deadline.split('.');
        if (parts.length === 3) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          const deadlineDate = new Date(y, m, d);

          if (today >= deadlineDate) {
            // Deadline is today or passed, send TG
            try {
              const res = await fetch(`https://api.telegram.org/bot${state.settings.tgToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: state.settings.tgChatId,
                  text: `⚠️ Дедлайн задачи!\n\n${task.note}\nСрок: ${task.deadline}`
                })
              });
              if (res.ok) {
                newTasks[i] = { ...task, tgSent: true };
                updated = true;
              }
            } catch (e) {
              console.error('Push error:', e);
            }
          }
        }
      }

      if (updated) {
        setState({ ...state, tasks: newTasks });
      }
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 1000 * 60 * 60); // check every hour
    return () => clearInterval(interval);
  }, [state.tasks, state.settings, setState, state]);

  return (
    <div className="flex flex-col h-screen overflow-hidden text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-8 pt-10 pb-4 bg-transparent shrink-0">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight m-0 drop-shadow-md">
            {activeTab === 'tasks' && 'Assistant'}
            {activeTab === 'food' && 'Калории'}
            {activeTab === 'money' && 'Финансы'}
            {activeTab === 'goals' && 'Цели'}
          </h1>
          {activeTab === 'tasks' && <p className="text-[var(--color-text-dim)] text-[14px] font-medium m-0 mt-1">{todayFormatted}</p>}
        </div>
        <button onClick={() => setIsSettingsOpen(true)} className="w-[44px] h-[44px] glass-panel rounded-2xl flex items-center justify-center text-white cursor-pointer active:scale-95 fluid-trans shadow-lg">
          <Settings size={20} className="text-white" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pb-32 relative flex flex-col">
        <div className="flex-1">
          {activeTab === 'tasks' && <TasksTab state={state} setState={setState} />}
          {activeTab === 'food' && <FoodTab state={state} setState={setState} />}
          {activeTab === 'money' && <MoneyTab state={state} setState={setState} />}
          {activeTab === 'goals' && <GoalsTab state={state} setState={setState} />}
        </div>
        
        {/* Logo Footer */}
        <footer className="w-full flex justify-center py-6 mt-4 opacity-70">
          <img src="https://i.ibb.co/R44v9v4z/Frame-43172.jpg" alt="Logo" className="w-[48px] h-[48px] object-cover rounded-[16px] shadow-lg grayscale transition-all duration-300 hover:grayscale-0 hover:scale-105" referrerPolicy="no-referrer" />
        </footer>
      </main>

      {/* Floating Pill Tab Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] h-[72px] bg-[rgba(22,22,24,0.95)] backdrop-blur-3xl rounded-full border border-white/5 flex justify-evenly items-center z-[60] shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
        <TabItem icon={<LayoutGrid size={22} />} active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        <TabItem icon={<Coffee size={22} />} active={activeTab === 'food'} onClick={() => setActiveTab('food')} />
        <TabItem icon={<Wallet size={22} />} active={activeTab === 'money'} onClick={() => setActiveTab('money')} />
        <TabItem icon={<Activity size={22} />} active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && <SettingsModal state={state} setState={setState} onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

function TabItem({ icon, active, onClick }: { icon: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={`relative flex flex-col items-center justify-center w-14 h-14 fluid-trans active:scale-90 bg-transparent border-none cursor-pointer ${active ? 'text-accent' : 'text-[#777777] hover:text-white/80'}`}
    >
      <div className={`fluid-trans flex items-center justify-center ${active ? '-translate-y-1.5 drop-shadow-[0_0_8px_rgba(255,94,0,0.5)]' : ''}`}>
        {icon}
      </div>
      <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full bg-accent fluid-trans neon-glow ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
    </button>
  );
}
