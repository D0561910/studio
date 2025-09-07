export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // ISO string
  description?: string;
  paymentType: 'cash' | 'credit';
};

export type Category = {
  id: string;
  name: string;
  icon: string; // Corresponds to a key in the Icons object
  type: 'income' | 'expense';
};
