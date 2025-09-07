'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Transaction, Category } from '@/lib/types';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';

const defaultExpenseCategories: Omit<Category, 'id' | 'type'>[] = [
  { name: 'Bills', icon: 'bills' },
  { name: 'Clothes', icon: 'shopping' },
  { name: 'Drink', icon: 'other' },
  { name: 'Food', icon: 'groceries' },
  { name: 'House', icon: 'housing' },
  { name: 'Other', icon: 'other' },
  { name: 'Shopping', icon: 'shopping'},
  { name: 'Travel', icon: 'travel' },
];

const defaultIncomeCategories: Omit<Category, 'id' | 'type'>[] = [
    { name: 'Investments', icon: 'investments' },
    { name: 'Extra income', icon: 'freelance' },
    { name: 'Lottery', icon: 'gift' },
    { name: 'Gifts', icon: 'gift' },
    { name: 'Salary', icon: 'salary' },
    { name: 'Savings', icon: 'piggyBank' },
];


interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  categories: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  defaultCategories: Category[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const userId = user?.uid;

  const writeDefaultCategories = useCallback(async (uid: string) => {
    const categoriesRef = collection(db, 'users', uid, 'categories');
    const batch = writeBatch(db);
    
    defaultExpenseCategories.forEach(category => {
      const docRef = doc(categoriesRef);
      batch.set(docRef, { ...category, type: 'expense' });
    });

    defaultIncomeCategories.forEach(category => {
        const docRef = doc(categoriesRef);
        batch.set(docRef, { ...category, type: 'income' });
    });

    await batch.commit();
  }, []);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setCategories([]);
      return;
    }

    const transactionsQuery = query(collection(db, `users/${userId}/transactions`), orderBy('date', 'desc'));
    const categoriesQuery = query(collection(db, `users/${userId}/categories`), orderBy('name'));

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const loadedTransactions: Transaction[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(loadedTransactions);
    });

    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      if (snapshot.empty) {
        writeDefaultCategories(userId);
      } else {
        const loadedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(loadedCategories);
      }
    });

    return () => {
      unsubscribeTransactions();
      unsubscribeCategories();
    };
  }, [userId, writeDefaultCategories]);
  

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!userId) return;
    await addDoc(collection(db, `users/${userId}/transactions`), transaction);
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!userId) return;
    const { id, ...data } = updatedTransaction;
    const docRef = doc(db, `users/${userId}/transactions`, id);
    await updateDoc(docRef, data);
  };

  const deleteTransaction = async (id: string) => {
    if (!userId) return;
    const docRef = doc(db, `users/${userId}/transactions`, id);
    await deleteDoc(docRef);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!userId) return;
    if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase() && c.type === category.type)) {
        toast({
            variant: "destructive",
            title: "Error",
            description: `A category with this name already exists for ${category.type}.`
        });
        return;
    }
    await addDoc(collection(db, `users/${userId}/categories`), category);
    toast({ title: 'Success', description: 'Category added successfully.' });
  };

  const deleteCategory = async (id: string) => {
    if (!userId) return;
    
    const categoryToDelete = categories.find(c => c.id === id);
    if (!categoryToDelete) return;
    
    const isDefault = (categoryToDelete.type === 'income' 
        ? defaultIncomeCategories 
        : defaultExpenseCategories).some(dc => dc.name === categoryToDelete.name);

    if (isDefault) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot delete a default category."
        });
        return;
    }
    
    const categoryInUse = transactions.some(t => t.category === categoryToDelete.name);
    if (categoryInUse) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Cannot delete category as it is currently used in transactions."
        });
        return;
    }

    const docRef = doc(db, `users/${userId}/categories`, id);
    await deleteDoc(docRef);
  };
  
  const defaultCategories = useMemo(() => {
    return [
      ...defaultExpenseCategories.map(c => ({...c, id: c.name, type: 'expense' as const})),
      ...defaultIncomeCategories.map(c => ({...c, id: c.name, type: 'income' as const})),
    ];
  }, []);

  const incomeCategories = useMemo(() => categories.filter(c => c.type === 'income'), [categories]);
  const expenseCategories = useMemo(() => categories.filter(c => c.type === 'expense'), [categories]);

  return (
    <AppContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        categories,
        incomeCategories,
        expenseCategories,
        addCategory,
        deleteCategory,
        defaultCategories,
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
