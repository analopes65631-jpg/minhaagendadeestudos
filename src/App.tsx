import { useState, useEffect, useMemo, useRef, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  Award, 
  Calendar,
  Moon,
  Sun,
  ChevronRight,
  LayoutDashboard,
  Timer as TimerIcon,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Priority = 'Alta' | 'Média' | 'Baixa';

interface Task {
  id: string;
  subject: string;
  topic: string;
  priority: Priority;
  completed: boolean;
  createdAt: number;
}

type Tab = 'dashboard' | 'tasks' | 'pomodoro' | 'settings';

export default function App() {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('study-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark-mode');
    return saved ? JSON.parse(saved) : true;
  });

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Task Form State
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('Média');

  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('study-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // --- Handlers ---
  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTopic.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      subject: newSubject,
      topic: newTopic,
      priority: newPriority,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setNewSubject('');
    setNewTopic('');
    setNewPriority('Média');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Notification or Switch Session
    const message = isWorkSession ? "Fim do tempo de foco! Hora de uma pausa." : "Pausa terminada! Pronto para estudar?";
    alert(message);
    
    setIsWorkSession(!isWorkSession);
    setTimeLeft(isWorkSession ? 5 * 60 : 25 * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isWorkSession ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Computed Stats ---
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    return { total, completed, pending, progress };
  }, [tasks]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const priorityWeight = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }, [tasks]);

  const currentDate = new Intl.DateTimeFormat('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  }).format(new Date());

  // --- Components ---
  const PriorityBadge = ({ priority }: { priority: Priority }) => {
    const colors = {
      'Alta': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Média': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Baixa': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    };
    return (
      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-200' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* --- Sidebar / Navigation --- */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 p-4 lg:left-0 lg:top-0 lg:w-64 lg:bottom-0 ${isDarkMode ? 'bg-zinc-900/80' : 'bg-white/80'} backdrop-blur-xl border-t lg:border-t-0 lg:border-r ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div className="flex lg:flex-col justify-around lg:justify-start lg:gap-8 h-full items-center lg:items-start max-lg:px-4">
          <div className="hidden lg:flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-white">StudyFlow</h1>
          </div>

          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'tasks', icon: Calendar, label: 'Matérias' },
            { id: 'pomodoro', icon: TimerIcon, label: 'Pomodoro' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'text-white bg-indigo-600 shadow-lg shadow-indigo-500/20' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:block font-semibold">{item.label}</span>
            </button>
          ))}
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex lg:mt-auto items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="hidden lg:block font-semibold">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="lg:ml-64 p-4 md:p-10 pb-32 lg:pb-10 max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <p className="text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.2em] font-bold text-[10px]">{currentDate}</p>
            <h2 className="text-4xl font-extrabold tracking-tighter dark:text-white">Olá, <span className="text-indigo-500">Estudante!</span> 👋</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-6 py-3 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'} flex items-center gap-6`}>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Progresso Diário</p>
                <div className={`w-36 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.progress}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400" 
                  />
                </div>
              </div>
              <span className="text-2xl font-black tabular-nums text-indigo-500">{stats.progress}%</span>
            </div>
          </div>
        </header>

        {/* --- Dashboard Tab --- */}
        {activeTab === 'dashboard' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-8"
          >
            <div className={`md:col-span-8 p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                  </div>
                  Atividades de Hoje
                </h3>
                <button onClick={() => setActiveTab('tasks')} className="text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors bg-indigo-500/10 px-3 py-1 rounded-full">Ver todos</button>
              </div>
              <div className="space-y-4">
                {sortedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${isDarkMode ? 'bg-zinc-950/50 border-zinc-800/50' : 'bg-zinc-50 border-zinc-200'} hover:border-indigo-500/30 group`}>
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleTask(task.id)} className="transition-transform active:scale-75">
                        {task.completed ? (
                          <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className={`w-6 h-6 rounded-lg border-2 transition-colors ${isDarkMode ? 'border-zinc-700 hover:border-indigo-500' : 'border-zinc-300 hover:border-indigo-500'}`} />
                        )}
                      </button>
                      <div>
                        <p className={`font-bold leading-tight ${task.completed ? 'line-through opacity-40' : 'text-zinc-200'}`}>{task.subject}</p>
                        <p className="text-xs text-zinc-500 font-medium">{task.topic}</p>
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="py-12 text-center bg-zinc-950/30 rounded-3xl border-2 border-dashed border-zinc-800 flex flex-col items-center">
                    <Plus className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-zinc-500 font-medium">Nenhuma tarefa para listar.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-4 space-y-8">
              <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <h3 className="font-bold text-sm text-zinc-500 uppercase tracking-widest mb-6">Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <p className="text-2xl font-black text-white">{stats.total}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Matérias</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <p className="text-2xl font-black text-white">{stats.pending}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pendentes</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <p className="text-2xl font-black text-white">{stats.completed}</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Concluídas</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <p className="text-2xl font-black text-white">85%</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Foco</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group border border-indigo-400/20">
                <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <TimerIcon className="w-5 h-5 text-indigo-100" />
                    <h3 className="font-bold text-lg">Foco Ativo</h3>
                  </div>
                  <p className="text-5xl font-black tracking-tighter tabular-nums mb-6">{formatTime(timeLeft)}</p>
                  <button 
                    onClick={() => setActiveTab('pomodoro')} 
                    className="w-full py-3 bg-white text-indigo-700 font-bold rounded-2xl hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2"
                  >
                    Abrir Timer <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- Tasks Tab --- */}
        {activeTab === 'tasks' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* --- Add Task Form --- */}
            <form onSubmit={handleAddTask} className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Plus className="w-5 h-5 text-indigo-500" />
                </div>
                Planejar Novo Estudo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Matéria</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Ex: Física"
                    className={`w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Tópico</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Ex: Leis de Newton"
                    className={`w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Prioridade</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className={`w-full px-5 py-3.5 rounded-2xl border outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3.5 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Criar Tarefa
                </button>
              </div>
            </form>

            <div className={`p-8 rounded-[32px] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-xl flex items-center gap-3 text-white">
                  <Filter className="w-5 h-5 text-zinc-500" />
                  Mural de Matérias
                </h3>
              </div>
              <div className="space-y-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {sortedTasks.map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      key={task.id}
                      className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        task.completed 
                          ? 'bg-zinc-950/20 border-transparent opacity-40 grayscale' 
                          : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700 active:scale-[0.99] group'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <button onClick={() => toggleTask(task.id)} className="relative overflow-hidden rounded-xl border-none p-0">
                          {task.completed ? (
                            <div className="w-7 h-7 bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 bg-zinc-800 border-2 border-zinc-700 hover:border-indigo-500 transition-all" />
                          )}
                        </button>
                        <div>
                          <p className={`font-bold text-lg leading-tight ${task.completed ? 'line-through' : 'text-zinc-100'}`}>{task.subject}</p>
                          <p className="text-sm text-zinc-500 font-medium">{task.topic}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <PriorityBadge priority={task.priority} />
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-3 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                  <div className="py-24 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-zinc-950 rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6">
                      <BookOpen className="w-10 h-10 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 font-bold text-lg">Nada por aqui ainda.</p>
                    <p className="text-zinc-600 text-sm max-w-[240px] mt-1">Crie sua primeira tarefa de estudo para começar a rastrear seu fuxo.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- Pomodoro Tab --- */}
        {activeTab === 'pomodoro' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-16"
          >
            <div className="relative">
              {/* Outer Ring Animation */}
              <div className={`absolute -inset-10 bg-indigo-600/10 rounded-full blur-[80px] transition-all duration-1000 ${isActive ? 'scale-150 opacity-60' : 'scale-100 opacity-20'}`} />
              
              <div className={`relative w-80 h-80 md:w-[420px] md:h-[420px] rounded-full border-[10px] flex flex-col items-center justify-center transition-all shadow-[0_0_60px_-15px_rgba(99,102,241,0.2)] ${
                isActive 
                  ? 'border-indigo-600' 
                  : (isDarkMode ? 'border-zinc-900' : 'border-zinc-200 shadow-none')
              } bg-zinc-950`}>
                <div className="absolute inset-0 rounded-full border-[10px] border-indigo-600/5" />
                
                <span className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mb-4">
                  {isWorkSession ? 'MODO FOCO' : 'PAUSA CURTA'}
                </span>
                <span className="text-8xl md:text-[120px] font-black tracking-tighter tabular-nums leading-none text-white">
                  {formatTime(timeLeft)}
                </span>
                
                <div className="mt-12 flex gap-6">
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all active:scale-95 shadow-2xl ${
                      isActive 
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/40'
                    }`}
                  >
                    {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                  <button
                    onClick={resetTimer}
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all active:scale-95 ${
                      isDarkMode ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-500' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    <RotateCcw className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-20 max-w-sm w-full space-y-8">
              <div className="flex gap-4 p-2 bg-zinc-950 border border-zinc-800 rounded-[28px]">
                 <button 
                  onClick={() => {
                    setIsWorkSession(true);
                    setIsActive(false);
                    setTimeLeft(25 * 60);
                  }}
                  className={`flex-1 py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    isWorkSession 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  Foco (25m)
                </button>
                <button 
                  onClick={() => {
                    setIsWorkSession(false);
                    setIsActive(false);
                    setTimeLeft(5 * 60);
                  }}
                  className={`flex-1 py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    !isWorkSession 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                      : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  Pausa (5m)
                </button>
              </div>

              <div className="p-6 rounded-[28px] bg-zinc-900/50 border border-zinc-800 text-center">
                <p className="text-zinc-500 font-medium italic text-sm leading-relaxed">
                  "O segredo para progredir é começar."
                </p>
                <p className="text-[10px] font-black text-zinc-600 mt-3 uppercase tracking-widest">— Mark Twain</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
