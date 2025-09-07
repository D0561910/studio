import {
  Utensils,
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
  Dumbbell
} from 'lucide-react';

export const Icons: Record<string, LucideIcon> = {
  groceries: ShoppingCart,
  transport: Car,
  housing: Home,
  entertainment: Film,
  health: HeartPulse,
  education: GraduationCap,
  travel: Plane,
  work: Briefcase,
  gifts: Gift,
  salary: Landmark,
  investments: PiggyBank,
  freelance: Wallet,
  bills: Receipt,
  shopping: Shirt,
  fitness: Dumbbell,
  other: CircleDollarSign,
};

export type IconKey = keyof typeof Icons;

export const getIcon = (name: string): LucideIcon => {
  return Icons[name] || CircleDollarSign;
};
