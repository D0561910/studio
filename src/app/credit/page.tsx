'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { useAppContext } from '@/contexts/app-context';
import { analyzeCreditSpending, CreditAnalysisOutput } from '@/ai/flows/credit-analysis-flow';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';


export default function CreditAnalysisPage() {
  const { transactions } = useAppContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CreditAnalysisOutput | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
        const creditTransactions = transactions.filter(t => t.paymentType === 'credit' && t.type === 'expense');

        if (creditTransactions.length === 0) {
            toast({
                variant: 'destructive',
                title: 'No Credit Transactions',
                description: 'There are no credit expense transactions to analyze.',
            });
            setIsLoading(false);
            return;
        }

      const result = await analyzeCreditSpending({
        transactions: JSON.stringify(creditTransactions),
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing credit spending:', error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze your credit spending at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Credit Spending Analysis</CardTitle>
                        <CardDescription>
                        Get AI-powered insights into your monthly credit card expenses and fees.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6 text-center">
                        {!analysis && !isLoading && (
                            <>
                                <CreditCard className="h-16 w-16 text-primary" />
                                <p className="text-muted-foreground">
                                Click the button below to analyze your credit transactions.
                                </p>
                            </>
                        )}
                        <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                            </>
                        ) : (
                            'Analyze Credit Spending'
                        )}
                        </Button>
                        
                        {analysis && (
                        <div className="w-full space-y-6 text-left">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Credit Expenses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(analysis.totalExpenses)}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Identified Card Fees</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{formatCurrency(analysis.totalFees)}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Alert>
                                <AlertTitle>AI Insights</AlertTitle>
                                <AlertDescription>{analysis.insights}</AlertDescription>
                            </Alert>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Expenses by Category</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                    <TableHeader>
                                        <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(analysis.expensesByCategory).map(([category, amount]) => (
                                        <TableRow key={category}>
                                            <TableCell>{category}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                                        </TableRow>
                                        ))}
                                    </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
