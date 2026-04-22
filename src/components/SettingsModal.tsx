import { AppState } from '../types';
import { X, Bot, BellRing, DownloadCloud } from 'lucide-react';
import { useState } from 'react';

export default function SettingsModal({ state, setState, onClose }: { state: AppState, setState: (v: any) => void, onClose: () => void }) {
  const [token, setToken] = useState(state.settings.tgToken);
  const [chatId, setChatId] = useState(state.settings.tgChatId);
  const [budget, setBudget] = useState(state.budget.toString());
  const [currentMonthName, setCurrentMonthName] = useState(state.settings.currentMonthName || 'Май');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ultimate_assistant_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    setState((prev: AppState) => ({
      ...prev,
      budget: parseInt(budget, 10) || prev.budget,
      settings: {
        ...prev.settings,
        tgToken: token,
        tgChatId: chatId,
        currentMonthName
      }
    }));
    onClose();
  };

  const testBot = async () => {
    setTestStatus('Отправка...');
    try {
       const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             chat_id: chatId,
             text: `✅ Бот успешно подключен к Личному Помощнику!`
          })
       });
       if (res.ok) {
         setTestStatus('✅ Успех!');
         setTimeout(() => setTestStatus(null), 2000);
       } else {
         setTestStatus('❌ Ошибка');
       }
    } catch {
       setTestStatus('❌ Ошибка сети');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A0A0A]/40 backdrop-blur-md">
      <div className="glass-panel p-6 rounded-[32px] w-full max-w-sm shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 bg-transparent border-none p-2 cursor-pointer fluid-trans hover:text-white">
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="p-3 border border-white/10 rounded-2xl bg-black/30 text-accent fluid-trans">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white m-0">Telegram Push</h2>
            <p className="text-sm text-[var(--color-text-dim)] m-0 mt-0.5">Настройка уведомлений</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--color-text-dim)] ml-1 mb-1 block">Bot Token</label>
            <input 
              type="text" 
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="1234567890:AAH..."
               className="w-full bg-black/30 text-white px-4 py-4 rounded-[16px] outline-none border border-white/10 focus:border-accent/50 font-mono text-sm fluid-trans placeholder-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-dim)] ml-1 mb-1 block">Chat ID</label>
            <input 
              type="text" 
               value={chatId}
               onChange={e => setChatId(e.target.value)}
              placeholder="123456789"
              className="w-full bg-black/30 text-white px-4 py-4 rounded-[16px] outline-none border border-white/10 focus:border-accent/50 font-mono text-sm fluid-trans placeholder-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-dim)] ml-1 mb-1 block">Месячный бюджет (₽)</label>
            <input 
              type="number" 
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="50000"
              className="w-full bg-black/30 text-white px-4 py-4 rounded-[16px] outline-none border border-white/10 focus:border-accent/50 text-sm fluid-trans placeholder-white/30"
            />
          </div>

          <div>
            <label className="text-xs text-[var(--color-text-dim)] ml-1 mb-1 block">Текущий месяц (для целей)</label>
            <input 
              type="text" 
              value={currentMonthName}
              onChange={e => setCurrentMonthName(e.target.value)}
              placeholder="Например, Май"
              className="w-full bg-black/30 text-white px-4 py-4 rounded-[16px] outline-none border border-white/10 focus:border-accent/50 text-sm fluid-trans placeholder-white/30"
            />
          </div>

          {(token && chatId) && (
            <button 
              onClick={testBot}
              className="w-full flex items-center justify-center gap-2 py-4 glass-panel text-[var(--color-text-dim)] rounded-[16px] border-none hover:text-white cursor-pointer active:scale-95 fluid-trans hover:bg-white/5"
            >
              <BellRing size={18} />
              {testStatus || 'Тестовое уведомление'}
            </button>
          )}

          <div className="pt-4 mt-2">
            <button 
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 mb-4 py-4 glass-panel border border-white/10 text-white font-bold rounded-[16px] shadow-lg active:scale-95 cursor-pointer fluid-trans hover:bg-white/5"
            >
              <DownloadCloud size={20} />
              Экспорт данных (JSON)
            </button>
            <button 
              onClick={handleSave}
              className="w-full bg-accent neon-glow text-[#0A0A0A] border-none font-bold py-4 rounded-[16px] shadow-lg active:scale-95 cursor-pointer fluid-trans"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
