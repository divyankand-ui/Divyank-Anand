import { createClient } from '@supabase/supabase-js';
import { User, Expense, ExpenseType, Category } from '../types';

/**
 * REAL SUPABASE SERVICE
 */

const SUPABASE_URL = 'https://poqoqlnfdvqpuweapjce.supabase.co';
const SUPABASE_KEY = 'sb_publishable_pQIAg0hKrcECIhl54-Sefw_rc-vu3JF';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to map DB columns (snake_case) to App types (camelCase)
const mapUserFromDB = (authData: any, profileData: any): User => ({
  id: authData.id,
  email: authData.email || '',
  name: profileData?.name || authData.email?.split('@')[0] || 'User',
  balance: parseFloat(profileData?.balance || 0),
});

const mapExpenseFromDB = (dbItem: any): Expense => ({
  id: dbItem.id,
  userId: dbItem.user_id,
  description: dbItem.description,
  amount: parseFloat(dbItem.amount),
  date: dbItem.date,
  type: dbItem.type as ExpenseType,
  category: dbItem.category as Category,
  groupMembers: dbItem.group_members ? parseFloat(dbItem.group_members) : undefined,
  splitAmount: dbItem.split_amount ? parseFloat(dbItem.split_amount) : undefined,
  createdAt: new Date(dbItem.created_at).getTime(),
  aiAnalysis: dbItem.ai_analysis
});

// --- Auth Operations ---

export const signUp = async (email: string, password: string, name: string): Promise<User> => {
  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Sign up failed - Check if email confirmation is enabled in Supabase");

  // 2. Create Profile Entry
  // We use upsert to be safe, though insert is standard for new users.
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([
      { id: authData.user.id, email, name, balance: 0 }
    ], { onConflict: 'id' });

  if (profileError) {
    console.error("Profile creation error:", profileError);
    // We don't throw here because the auth user was created successfully.
    // The profile might be created via a trigger if the SQL script was set up that way.
  }

  return {
    id: authData.user.id,
    email: email,
    name: name,
    balance: 0
  };
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.user) throw new Error("No user returned");

  // Fetch profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return mapUserFromDB(data.user, profile);
};

export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const resetPassword = async (email: string): Promise<void> => {
  // This sends a password reset email to the user
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin, // Redirects back to this app
  });
  if (error) throw error;
};

export const getSession = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return mapUserFromDB(session.user, profile);
};

export const updateUserBalance = async (userId: string, newBalance: number): Promise<void> => {
    const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', userId);
        
    if (error) throw error;
};

// --- CRUD Operations for Expenses ---

export const getExpenses = async (userId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapExpenseFromDB);
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
  const payload = {
    user_id: expense.userId,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    type: expense.type,
    category: expense.category,
    group_members: expense.groupMembers,
    split_amount: expense.splitAmount,
    ai_analysis: expense.aiAnalysis
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return mapExpenseFromDB(data);
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
  // Map updates to snake_case
  const payload: any = {};
  if (updates.description) payload.description = updates.description;
  if (updates.amount) payload.amount = updates.amount;
  if (updates.date) payload.date = updates.date;
  if (updates.type) payload.type = updates.type;
  if (updates.category) payload.category = updates.category;
  if (updates.groupMembers) payload.group_members = updates.groupMembers;
  if (updates.splitAmount) payload.split_amount = updates.splitAmount;
  if (updates.aiAnalysis) payload.ai_analysis = updates.aiAnalysis;

  const { data, error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapExpenseFromDB(data);
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
};