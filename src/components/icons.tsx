import {
  Car,
  Home,
  Film,
  ShoppingCart,
  HeartPulse,
  Book,
  Plane,
  Briefcase,
  Gift,
  Landmark,
  PiggyBank,
  Wallet,
  type LucideIcon,
  CircleDollarSign,
  Receipt,
  GraduationCap,
  Shirt,
  Dumbbell,
  Ticket,
  Utensils,
  Droplet
} from 'lucide-react';

export const Icons: Record<string, LucideIcon> = {
  // Expenses
  bills: Receipt,
  clothes: Shirt,
  drink: Droplet,
  food: Utensils,
  house: Home,
  shopping: ShoppingCart,
  travel: Plane,

  // Income
  investments: Landmark,
  extra_income: Wallet,
  lottery: Ticket,
  gifts: Gift,
  salary: Briefcase,
  savings: PiggyBank,
  
  // Generic / Default
  other: CircleDollarSign,
  groceries: ShoppingCart,
  transport: Car,
  housing: Home,
  entertainment: Film,
  health: HeartPulse,
  education: GraduationCap,
  work: Briefcase,
  freelance: Wallet,
  fitness: Dumbbell,
};

export type IconKey = keyof typeof Icons;

export const getIcon = (name: string): LucideIcon => {
  return Icons[name] || CircleDollarSign;
};
