'use client';

import { SidebarTrigger } from './ui/sidebar';
import { TransactionDialog } from './transaction-dialog';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  let title = 'Dashboard';
  if (pathname === '/spending-distribution') {
    title = 'Spending Distribution';
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        
          <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
        
      </div>
      <TransactionDialog>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">Add Transaction</span>
        </Button>
      </TransactionDialog>
    </header>
  );
}
