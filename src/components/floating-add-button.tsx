'use client';

import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import { TransactionDialog } from './transaction-dialog';

export function FloatingAddButton() {
  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <TransactionDialog>
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Transaction</span>
        </Button>
      </TransactionDialog>
    </div>
  );
}
