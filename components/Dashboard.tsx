import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Expense, ExpenseType, Category } from '../types';
import { getExpenses, createExpense, updateExpense, deleteExpense, signOut, updateUserBalance } from '../services/storageService';
import { analyzeExpense } from '../services/geminiService';
import { Button } from './Button';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type TimeFilter = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';

const CATEGORIES: Category[] = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

const CATEGORY_ICONS: Record<Category, React.ReactElement> = {
  Food: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m-15.686 0A8.959 8.959 0 013 12c0-.778.099-1.533.284-2.253m0 0A11.953 11.953 0 0112 10.5c2.998 0 5.74-1.1 7.843-2.918" /></svg>,
  Travel: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Shopping: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
  Bills: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Entertainment: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Health: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Education: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Other: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>,
};

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Wallet & Filter State
  const [currentBalance, setCurrentBalance] = useState<number>(user.balance || 0);
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('MONTH');

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<ExpenseType>('PERSONAL');
  const [category, setCategory] = useState<Category>('Other');
  const [groupMembers, setGroupMembers] = useState('1');

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getExpenses(user.id);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Derived State: Filtered Expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      switch(timeFilter) {
        case 'DAY':
          return expDate >= startOfToday;
        case 'WEEK':
          const startOfWeek = new Date(startOfToday);
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
          return expDate >= startOfWeek;
        case 'MONTH':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return expDate >= startOfMonth;
        case 'QUARTER':
           const currentQuarter = Math.floor((now.getMonth() + 3) / 3);
           const startOfQuarter = new Date(now.getFullYear(), (currentQuarter - 1) * 3, 1);
           return expDate >= startOfQuarter;
        case 'YEAR':
           const startOfYear = new Date(now.getFullYear(), 0, 1);
           return expDate >= startOfYear;
        default:
          return true;
      }
    });
  }, [expenses, timeFilter]);

  // Derived State: Category Statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    let total = 0;
    
    // Initialize
    CATEGORIES.forEach(c => stats[c] = 0);
    
    filteredExpenses.forEach(exp => {
      const val = exp.amount;
      stats[exp.category] = (stats[exp.category] || 0) + val;
      total += val;
    });

    return { stats, total };
  }, [filteredExpenses]);


  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setDate(expense.date);
      setType(expense.type);
      setCategory(expense.category);
      setGroupMembers(expense.groupMembers ? expense.groupMembers.toString() : '1');
    } else {
      setEditingExpense(null);
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('PERSONAL');
      setCategory('Other');
      setGroupMembers('1');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const calculateSplit = (total: number, members: number) => {
    return members > 0 ? parseFloat((total / members).toFixed(2)) : total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const numericAmount = parseFloat(amount);
    const numericMembers = parseInt(groupMembers);
    const splitAmount = type === 'GROUP' ? calculateSplit(numericAmount, numericMembers) : numericAmount;

    const payload = {
      description,
      amount: numericAmount,
      date,
      type,
      category,
      groupMembers: type === 'GROUP' ? numericMembers : undefined,
      splitAmount: type === 'GROUP' ? splitAmount : undefined,
    };

    try {
      setLoading(true);
      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await createExpense({
          ...payload,
          userId: user.id,
        });
        
        // Update balance logic: Deduct full amount from personal balance (simple logic)
        // In a real app we might ask if the user paid the full group amount
        const newBal = currentBalance - numericAmount;
        await updateUserBalance(user.id, newBal);
        setCurrentBalance(newBal);
      }
      await fetchExpenses();
      handleCloseModal();
    } catch (err) {
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this expense?")) {
      await deleteExpense(id);
      fetchExpenses();
    }
  };

  const handleUpdateBalance = async () => {
    const val = parseFloat(tempBalance);
    if (!isNaN(val)) {
        await updateUserBalance(user.id, val);
        setCurrentBalance(val);
        setIsEditingBalance(false);
    }
  };

  const handleAIAnalysis = async (expense: Expense) => {
    try {
      setIsAnalyzing(true);
      const analysis = await analyzeExpense(expense.description, expense.amount, expense.type);
      
      // AI might suggest a category, let's map it if valid
      let newCat = expense.category;
      const aiCat = analysis.category;
      // Simple fuzzy match or check if exists in our list
      const matched = CATEGORIES.find(c => c.toLowerCase() === aiCat.toLowerCase());
      if (matched) newCat = matched;

      await updateExpense(expense.id, { aiAnalysis: analysis, category: newCat });
      await fetchExpenses();
    } catch (err) {
      console.error(err);
      alert("AI Analysis failed. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to format currency
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
        
      {/* Background Money Animation */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
        <div className="absolute top-10 left-10 text-4xl animate-float">₹</div>
        <div className="absolute top-40 right-20 text-6xl animate-float-delayed">💰</div>
        <div className="absolute bottom-20 left-1/4 text-5xl animate-float">💸</div>
        <div className="absolute top-1/2 right-1/3 text-4xl animate-float-delayed">₹</div>
        {/* Falling elements */}
        <div className="absolute -top-10 left-1/2 text-2xl animate-fall" style={{ left: '20%' }}>₹</div>
        <div className="absolute -top-10 left-1/2 text-2xl animate-fall" style={{ left: '80%', animationDelay: '2s' }}>₹</div>
      </div>

      {/* Top Bar */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="bg-brand-400 p-1.5 rounded shadow-[0_0_10px_rgba(250,204,21,0.4)]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-slate-900">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            <h1 className="text-xl font-bold text-white tracking-tight">MY EXPENSE <span className="text-brand-400">TRACKER</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 hidden sm:inline">Hello, <span className="text-white font-medium">{user.name}</span></span>
            <Button variant="secondary" onClick={() => { signOut(); onLogout(); }}>Sign Out</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Wallet & Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-brand-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                </div>
                <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Current Balance</h3>
                
                {isEditingBalance ? (
                    <div className="flex gap-2">
                         <input 
                            type="number" 
                            className="bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 w-full text-2xl font-mono"
                            value={tempBalance}
                            onChange={(e) => setTempBalance(e.target.value)}
                            autoFocus
                         />
                         <Button onClick={handleUpdateBalance} className="px-3">Save</Button>
                    </div>
                ) : (
                    <div className="flex items-end gap-2" onClick={() => { setTempBalance(currentBalance.toString()); setIsEditingBalance(true); }}>
                        <span className="text-4xl font-black text-white tracking-tight cursor-pointer hover:text-brand-400 transition-colors">{fmt(currentBalance)}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 mb-1.5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                )}
                <p className="mt-4 text-xs text-slate-500">Tap balance to edit manually</p>
            </div>

            {/* Spending Overview Chart */}
            <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider">Spending Analysis</h3>
                        <p className="text-2xl font-bold text-white mt-1">{timeFilter}LY SPEND: <span className="text-brand-400">{fmt(categoryStats.total)}</span></p>
                     </div>
                     {/* Time Filter Tabs */}
                     <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                        {(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'] as TimeFilter[]).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeFilter(tf)}
                                className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-all ${timeFilter === tf ? 'bg-slate-800 text-brand-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {tf}
                            </button>
                        ))}
                     </div>
                </div>

                {/* Categories Bar Chart */}
                <div className="space-y-3">
                   {categoryStats.total > 0 ? (
                       <div className="flex h-6 rounded-full overflow-hidden bg-slate-950 w-full">
                           {CATEGORIES.map((cat, i) => {
                               const amount = categoryStats.stats[cat];
                               const pct = (amount / categoryStats.total) * 100;
                               if (pct <= 0) return null;
                               // Generate colors based on index roughly
                               const colors = ['bg-brand-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400', 'bg-red-400', 'bg-indigo-400', 'bg-slate-400'];
                               return (
                                   <div 
                                    key={cat} 
                                    className={`${colors[i % colors.length]} h-full transition-all duration-500`} 
                                    style={{ width: `${pct}%` }} 
                                    title={`${cat}: ${fmt(amount)} (${pct.toFixed(1)}%)`}
                                   />
                               );
                           })}
                       </div>
                   ) : (
                       <div className="h-6 rounded-full bg-slate-950 w-full flex items-center justify-center text-xs text-slate-600">No data for this period</div>
                   )}
                   
                   {/* Legend Items (Top 4 sorted by spend) */}
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                       {CATEGORIES
                        .filter(c => categoryStats.stats[c] > 0)
                        .sort((a, b) => categoryStats.stats[b] - categoryStats.stats[a])
                        .slice(0, 4)
                        .map((cat, i) => (
                           <div key={cat} className="flex items-center gap-2 text-xs">
                               <div className={`w-2 h-2 rounded-full ${['bg-brand-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-pink-400', 'bg-red-400', 'bg-indigo-400', 'bg-slate-400'][CATEGORIES.indexOf(cat) % 8]}`}></div>
                               <span className="text-slate-300 truncate">{cat}</span>
                               <span className="text-slate-500 font-mono">{Math.round((categoryStats.stats[cat] / categoryStats.total) * 100)}%</span>
                           </div>
                       ))}
                   </div>
                </div>
            </div>
        </div>


        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">TRANSACTIONS</h2>
            <p className="text-slate-400 text-sm">History for selected period</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Expense
          </Button>
        </div>

        {loading && expenses.length === 0 ? (
          <div className="text-center py-20 text-slate-500">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 rounded-2xl border border-dashed border-slate-700">
             <div className="mx-auto h-12 w-12 text-slate-600 mb-4 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="mt-2 text-sm font-bold text-white">No transactions found</h3>
            <p className="mt-1 text-sm text-slate-500">Try changing the filter or add a new expense.</p>
          </div>
        ) : (
          <div className="bg-slate-900 shadow-xl shadow-black/20 border border-slate-800 rounded-xl overflow-hidden">
             <ul className="divide-y divide-slate-800">
               {filteredExpenses.map((expense) => (
                 <li key={expense.id} className="p-5 hover:bg-slate-800/50 transition-colors group">
                   <div className="flex items-center gap-4">
                     
                     {/* Icon Box */}
                     <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 shadow-sm">
                         {CATEGORY_ICONS[expense.category] || CATEGORY_ICONS['Other']}
                     </div>

                     {/* Main Content */}
                     <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-bold text-white truncate group-hover:text-brand-400 transition-colors">{expense.description}</h3>
                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${expense.type === 'GROUP' ? 'bg-indigo-900/30 text-indigo-300 border-indigo-900/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                {expense.type}
                            </span>
                        </div>
                        <div className="flex text-sm text-slate-500 items-center gap-3">
                            <span>{new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                            <span className="text-slate-400">{expense.category}</span>
                        </div>
                        
                        {expense.type === 'GROUP' && (
                           <div className="mt-1 text-xs text-indigo-300 flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                             <span>Split: {fmt(expense.splitAmount || 0)} / person ({expense.groupMembers})</span>
                           </div>
                        )}

                        {/* AI Tip Display */}
                        {expense.aiAnalysis && (
                          <div className="mt-2 text-xs text-slate-400 italic border-l-2 border-brand-500/30 pl-2">
                             "{expense.aiAnalysis.tip}"
                          </div>
                        )}
                     </div>

                     {/* Amount & Actions */}
                     <div className="flex flex-col items-end gap-1">
                        <span className="text-lg font-bold text-white font-mono">{fmt(expense.amount)}</span>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleOpenModal(expense)} className="text-slate-500 hover:text-white p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                           <button onClick={() => handleDelete(expense.id)} className="text-slate-500 hover:text-red-400 p-1"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                           <button onClick={() => handleAIAnalysis(expense)} disabled={isAnalyzing} className={`text-slate-500 hover:text-brand-400 p-1 ${isAnalyzing ? 'animate-spin' : ''}`}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></button>
                        </div>
                     </div>
                   </div>
                 </li>
               ))}
             </ul>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-md w-full p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-white mb-6 tracking-tight">
              {editingExpense ? 'EDIT EXPENSE' : 'ADD EXPENSE'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setType('PERSONAL')}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${type === 'PERSONAL' ? 'bg-brand-400 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => setType('GROUP')}
                  className={`py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${type === 'GROUP' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Group Split
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder-slate-500"
                  placeholder="e.g. Dinner at Mario's"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {type === 'GROUP' && (
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 animate-fade-in-down">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Number of People</label>
                  <input
                    type="number"
                    min="2"
                    value={groupMembers}
                    onChange={(e) => setGroupMembers(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  />
                  {amount && groupMembers && (
                    <div className="mt-3 text-sm text-slate-400 flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                       <span>Split per person:</span>
                       <span className="font-bold text-brand-400 text-lg">
                         {fmt(parseFloat(amount) / parseInt(groupMembers))}
                       </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" isLoading={loading}>Save Expense</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};