'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useAppContext } from '@/contexts/app-context';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { getIcon } from './icons';
import { Badge } from './ui/badge';
import { TransactionDialog } from './transaction-dialog';

export function RecentTransactions() {
  const { transactions, deleteTransaction } = useAppContext();
  const recentTransactions = transactions.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>A list of your 10 most recent transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => {
                const Icon = getIcon(transaction.category.toLowerCase());
                return (
                    <TableRow key={transaction.id}>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className="p-2 bg-muted rounded-full">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-medium">{transaction.category}</span>
                                    {transaction.description && <span className="text-xs text-muted-foreground">{transaction.description}</span>}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className={`${transaction.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <TransactionDialog transaction={transaction}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </TransactionDialog>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteTransaction(transaction.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </TableCell>
                    </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
