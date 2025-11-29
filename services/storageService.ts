import { User, Expense } from '../types';

/**
 * MOCK DATABASE SERVICE
 * Simulating Supabase with localStorage.
 */

const USERS_KEY = 'moneytracker_users';
const EXPENSES_KEY = 'moneytracker_expenses';
const SESSION_KEY = 'moneytracker_session';

// --- Auth Operations ---

export const signUp = async (email: string, password: string, name: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const usersRaw = localStorage.getItem(USERS_KEY);
  const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

  if (users.find((u) => u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    name,
    balance: 0,
  };

  users.push({ ...newUser, password }); 
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));

  return newUser;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const usersRaw = localStorage.getItem(USERS_KEY);
  const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const { password: _, ...safeUser } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  
  return safeUser;
};

export const signOut = async (): Promise<void> => {
  localStorage.removeItem(SESSION_KEY);
};

export const getSession = (): User | null => {
  const sessionRaw = localStorage.getItem(SESSION_KEY);
  return sessionRaw ? JSON.parse(sessionRaw) : null;
};

export const updateUserBalance = async (userId: string, newBalance: number): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update Users DB
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index].balance = newBalance;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Update Session
    const session = getSession();
    if (session && session.id === userId) {
        const updatedSession = { ...session, balance: newBalance };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        return updatedSession;
    }
    
    throw new Error("User not found");
};

// --- CRUD Operations for Expenses ---

export const getExpenses = async (userId: string): Promise<Expense[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const allRaw = localStorage.getItem(EXPENSES_KEY);
  const all: Expense[] = allRaw ? JSON.parse(allRaw) : [];
  // Sort by date descending
  return all
    .filter(item => item.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const allRaw = localStorage.getItem(EXPENSES_KEY);
  const all: Expense[] = allRaw ? JSON.parse(allRaw) : [];

  const newItem: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };

  all.push(newItem);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(all));
  return newItem;
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const allRaw = localStorage.getItem(EXPENSES_KEY);
  let all: Expense[] = allRaw ? JSON.parse(allRaw) : [];

  const index = all.findIndex(i => i.id === id);
  if (index === -1) throw new Error("Expense not found");

  all[index] = { ...all[index], ...updates };
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(all));
  return all[index];
};

export const deleteExpense = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const allRaw = localStorage.getItem(EXPENSES_KEY);
  let all: Expense[] = allRaw ? JSON.parse(allRaw) : [];

  const filtered = all.filter(i => i.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(filtered));
};