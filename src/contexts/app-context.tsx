'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
  where,
  writeBatch
} from 'firebase/firestore';
import { useAuth } from './auth-context';
import { useToast } from '@/hooks/use-toast';

const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Groceries', icon: 'groceries' },
  { name: 'Transport', icon: 'transport' },
  { name: 'Housing', icon: 'housing' },
  { name: 'Entertainment', icon: 'entertainment' },
  { name: 'Salary', icon: 'salary' },
  { name: 'Bills', icon: 'bills' },
  { name: 'Shopping', icon: 'shopping'},
  { name: 'Other', icon: 'other' },
];

interface AppContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  defaultCategories: Omit<Category, 'id'>[];
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
    defaultCategories.forEach(category => {
      const docRef = doc(categoriesRef);
      batch.set(docRef, category);
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
    if (categories.some(c => c.name.toLowerCase() === category.name.toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "A category with this name already exists."
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
    
    if (defaultCategories.some(dc => dc.name.toLowerCase() === categoryToDelete.name.toLowerCase())) {
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
  
  const mappedDefaultCategories = categories.filter(c => defaultCategories.some(dc => dc.name === c.name));

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
