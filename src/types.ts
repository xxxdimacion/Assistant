export type Task = {
  id: string;
  note: string;
  deadline: string; // DD.MM.YYYY
  completed: boolean;
  tgSent?: boolean;
  priority?: 'red' | 'orange' | 'green';
};

export type FoodEntry = {
  id: string;
  title: string;
  kcal: number;
  protein?: number;
  date: string; // ISO string 
};

export type MoneyEntry = {
  id: string;
  title: string;
  amount: number;
  date: string; // ISO string
};

export type GoalSource = 'Threads' | 'YouTube Shorts' | 'Reels' | 'TikTok' | 'TikTok ADS' | 'Meta ADS';

export type GoalStats = {
  target: number;
  current: number;
  sources: Record<GoalSource, number>;
};

export type CustomGoalItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type CustomGoalSection = {
  id: string;
  title: string;
  items: CustomGoalItem[];
};

export type AppState = {
  tasks: Task[];
  food: FoodEntry[];
  budget: number;
  money: MoneyEntry[];
  goals: {
    income: { target: number; current: number; };
    subscribers: GoalStats;
    salesTraff?: { target: number; current: number; };
  };
  goalsMay?: {
    income: { target: number; current: number; };
    subscribers: GoalStats;
    views?: GoalStats;
    salesTraff: { target: number; current: number; };
  };
  customGoalSections?: CustomGoalSection[];
  settings: {
    tgToken: string;
    tgChatId: string;
    currentMonthName?: string;
  }
};
