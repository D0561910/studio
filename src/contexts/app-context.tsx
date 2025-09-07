'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect } from 'react';
import type { Transaction, Category } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

const defaultCategories: Category[] = [
  { id: 'cat_1', name: 'Groceries', icon: 'groceries' },
  { id: 'cat_2', name: 'Transport', icon: 'transport' },
  { id: 'cat_3', name: 'Housing', icon: 'housing' },
  { id: 'cat_4', name: 'Entertainment', icon: 'entertainment' },
  { id: 'cat_5', name: 'Salary', icon: 'salary' },
  { id: 'cat_6', name: 'Bills', icon: 'bills' },
  { id: 'cat_7', name: 'Shopping', icon: 'shopping'},
  { id: 'cat_8', name: 'Other', icon: 'other' },
];

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', defaultCategories);

  useEffect(() => {
    // Simple migration for existing transactions without paymentType
    const transactionsNeedMigration = transactions.some(t => !t.paymentType);
    if (transactionsNeedMigration) {
      setTransactions(prev =>
        prev.map(t => ({
          ...t,
          paymentType: t.paymentType || 'cash',
        }))
      );
    }
  }, [transactions, setTransactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: `txn_${new Date().toISOString()}` };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev =>
      prev.map(t => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = { ...category, id: `cat_${new Date().toISOString()}` };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        addCategory,
        deleteCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
