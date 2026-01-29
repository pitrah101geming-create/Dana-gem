
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  status?: 'PENDING' | 'COMPLETED';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  color: string;
}

export interface VipStatus {
  isActive: boolean;
  expiryDate: string; // ISO string
  lastClaimDate: string; // ISO string
}

export type AppLanguage = 'id' | 'en';

export interface UserAccount {
  balance: number;
  name: string;
  phone: string;
  profileImage?: string;
  language: AppLanguage;
  transactions: Transaction[];
  goals: SavingsGoal[];
  contacts: Contact[];
  vip?: VipStatus;
}
