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
import { Wallet, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransactionDialog } from './transaction-dialog';
import { CategoryManager } from './category-manager';
import { BudgetToolDialog } from './budget-tool-dialog';
import { DataExport } from './data-export';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-semibold">BudgetWise</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <TransactionDialog>
                <Button className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Transaction
                </Button>
            </TransactionDialog>
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
      </SidebarFooter>
    </Sidebar>
  );
}
