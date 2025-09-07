'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { Wallet, Home, PieChart, Shapes, ArrowRightLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CategoryManager } from './category-manager';
import { BudgetToolDialog } from './budget-tool-dialog';
import { DataExport } from './data-export';
import Link from 'next/link';
import { getAuth, signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { TransactionDialog } from './transaction-dialog';
import { PlusCircle } from 'lucide-react';


export function AppSidebar() {
  const { toast } = useToast();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Success', description: 'Logged out successfully.'});
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to log out.'});
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-semibold">BudgetWise</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/" passHref>
                    <Button variant="ghost" className="w-full justify-start">
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                </Link>
            </SidebarMenuItem>
            <SidebarSeparator />
            <SidebarMenuItem>
                <Link href="/spending-distribution" passHref>
                    <Button variant="ghost" className="w-full justify-start">
                        <PieChart className="mr-2 h-4 w-4" />
                        Spending Distribution
                    </Button>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <Link href="/category-distribution" passHref>
                    <Button variant="ghost" className="w-full justify-start">
                        <Shapes className="mr-2 h-4 w-4" />
                        Category Distribution
                    </Button>
                </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <Link href="/income-expense-distribution" passHref>
                    <Button variant="ghost" className="w-full justify-start">
                        <ArrowRightLeft className="mr-2 h-4 w-4" />
                        Income vs. Expense
                    </Button>
                </Link>
            </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem>
            <CategoryManager />
          </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem>
            <BudgetToolDialog />
          </SidebarMenuItem>
          
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <DataExport />
         <SidebarSeparator />
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
