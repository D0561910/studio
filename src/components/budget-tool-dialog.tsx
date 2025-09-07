'use client';

import React, { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createBudget, type CreateBudgetOutput } from '@/ai/flows/budget-creation-tool';
import { useAppContext } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

type BudgetPlan = {
    category: string;
    allocated_budget: number;
}

export function BudgetToolDialog() {
  const { transactions } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateBudgetOutput | null>(null);

  const handleGenerateBudget = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const incomeData = transactions.filter(t => t.type === 'income');
      const spendingData = transactions.filter(t => t.type === 'expense');

      if (incomeData.length === 0 || spendingData.length === 0) {
        toast({
            variant: "destructive",
            title: "Not enough data",
            description: "Please add more income and expense transactions to generate a budget."
        });
        setIsLoading(false);
        return;
      }

      const response = await createBudget({
        incomeData: JSON.stringify(incomeData),
        spendingData: JSON.stringify(spendingData),
      });
      setResult(response);
    } catch (error) {
      console.error('Error generating budget:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate budget plan.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const parsedBudgetPlan: BudgetPlan[] | null = React.useMemo(() => {
    if (!result?.budgetPlan) return null;
    try {
        const parsed = JSON.parse(result.budgetPlan);
        // The AI might return a single object instead of an array of objects
        const plan = Array.isArray(parsed) ? parsed : (parsed.budgetPlan || null);
        
        if (Array.isArray(plan)) {
            return plan;
        }
        console.error("Parsed budget plan is not in the expected array format", parsed);
        return null;
    } catch (e) {
        console.error("Failed to parse budget plan JSON", e);
        return null;
    }
  }, [result]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Wand2 className="mr-2 h-4 w-4" />
          AI Budget Assistant
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Budget Assistant</DialogTitle>
          <DialogDescription>
            Let AI analyze your spending and create a personalized budget plan for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!result && !isLoading && (
             <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertTitle>Ready to Start?</AlertTitle>
                <AlertDescription>
                    Click the button below to generate a new budget plan based on your recent transaction history.
                </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-4">Analyzing your finances...</p>
            </div>
          )}

          {result && parsedBudgetPlan && Array.isArray(parsedBudgetPlan) && (
            <div className="space-y-4">
              {result.flaggedOverspending && (
                <Alert variant="destructive">
                  <AlertTitle>Overspending Alert!</AlertTitle>
                  <AlertDescription>
                    Our analysis suggests your spending might be higher than your income. This budget is designed to help you get back on track.
                  </AlertDescription>
                </Alert>
              )}
               <Alert>
                  <AlertTitle>Your Suggested Budget Plan</AlertTitle>
                  <AlertDescription>
                    Here is a budget plan tailored to your spending habits.
                  </AlertDescription>
                </Alert>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Allocated Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedBudgetPlan.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.allocated_budget)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

           {result && !parsedBudgetPlan && !isLoading && (
             <Alert variant="destructive">
                <AlertTitle>Analysis Failed</AlertTitle>
                <AlertDescription>
                    The AI assistant was unable to generate a budget plan. This might be due to a formatting or parsing error.
                </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleGenerateBudget} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Budget Plan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
