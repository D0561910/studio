'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Transaction, Category } from '@/lib/types';
import { db } from '@/lib/firebase';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { useAuth } from './auth-context';

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
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setCategories(defaultCategories);
      return;
    }

    const transactionsRef = ref(db, `users/${userId}/transactions`);
    const categoriesRef = ref(db, `users/${userId}/categories`);

    const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedTransactions: Transaction[] = data 
        ? Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Transaction, 'id'>) }))
        : [];
      setTransactions(loadedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    
    const unsubscribeCategories = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedCategories: Category[] = Object.entries(data).map(([id, value]) => ({ id, ...(value as Omit<Category, 'id'>) }));
        setCategories(loadedCategories);
      } else {
        // If no categories in DB, set default ones
        set(ref(db, `users/${userId}/categories`), defaultCategories.reduce((acc, cat) => ({...acc, [cat.id]: {name: cat.name, icon: cat.icon}}), {}));
        setCategories(defaultCategories);
      }
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
    };
  }, [userId]);
  

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (!userId) return;
    const newTransactionRef = push(ref(db, `users/${userId}/transactions`));
    set(newTransactionRef, transaction);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    if (!userId) return;
    const { id, ...data } = updatedTransaction;
    set(ref(db, `users/${userId}/transactions/${id}`), data);
  };

  const deleteTransaction = (id: string) => {
    if (!userId) return;
    remove(ref(db, `users/${userId}/transactions/${id}`));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
     if (!userId) return;
    const newCategoryRef = push(ref(db, `users/${userId}/categories`));
    set(newCategoryRef, category);
  };

  const deleteCategory = (id: string) => {
    if (!userId) return;
    // Check if default category
    if(defaultCategories.some(c => c.id === id)) return;
    remove(ref(db, `users/${userId}/categories/${id}`));
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
