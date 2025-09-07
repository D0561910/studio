'use client';

import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';

export function DataExport() {
  const { transactions } = useAppContext();
  const { toast } = useToast();

  const handleExport = () => {
    if (transactions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'There are no transactions to export.',
      });
      return;
    }

    const headers = ['id', 'type', 'amount', 'category', 'date', 'description'];
    const csvRows = [headers.join(',')];

    for (const row of transactions) {
      const values = headers.map(header => {
        const key = header as keyof typeof row;
        const value = row[key] ? ('' + row[key]).replace(/"/g, '\\"') : '';
        return `"${value}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `budgetwise-export-${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
        title: 'Export Successful',
        description: 'Your transaction data has been downloaded.',
    });
  };

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export Data
    </Button>
  );
}
