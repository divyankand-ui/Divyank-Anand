export interface User {
  id: string;
  email: string;
  name: string;
  balance?: number; // Current account balance
}

export type ExpenseType = 'PERSONAL' | 'GROUP';

export type Category = 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Entertainment' | 'Health' | 'Education' | 'Other';

export interface AIAnalysis {
  category: string;
  tip: string;
  isWasteful: boolean;
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: ExpenseType;
  category: Category; 
  
  // Group details
  groupMembers?: number; // Total people involved
  splitAmount?: number; // Amount per person
  
  createdAt: number;
  aiAnalysis?: AIAnalysis;
}

export type ViewState = 'LANDING' | 'LOGIN' | 'SIGNUP' | 'DASHBOARD';