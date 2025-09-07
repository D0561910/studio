'use client';

import React, { useMemo } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Header } from '@/components/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from '@/contexts/app-context';
import { isSameMonth, startOfMonth } from 'date-fns';
import { formatCurrency } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowRightLeft } from 'lucide-react';

const COLORS = [
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(220, 70%, 60%)',
    'hsl(160, 70%, 40%)',
    'hsl(40, 70%, 50%)',
];

const PieChartComponent = ({ data, title, total }: { data: any[], title: string, total: number }) => {
    return (
        <div className="w-full h-[400px] flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <div className="text-xl font-bold mb-4">Total: {formatCurrency(total)}</div>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export default function IncomeExpenseDistributionPage() {
    const { transactions } = useAppContext();

    const { incomeData, expenseData } = useMemo(() => {
        const currentMonthStart = startOfMonth(new Date());

        const monthlyTransactions = transactions.filter(t => isSameMonth(new Date(t.date), currentMonthStart));
        
        const processData = (type: 'income' | 'expense') => {
            const filtered = monthlyTransactions.filter(t => t.type === type);
            const distribution = filtered.reduce((acc, curr) => {
                const key = curr.category;
                acc[key] = (acc[key] || 0) + curr.amount;
                return acc;
            }, {} as Record<string, number>);

            const total = Object.values(distribution).reduce((sum, amount) => sum + amount, 0);

            const chartData = Object.entries(distribution).map(([name, value]) => ({
                name,
                value,
                percentage: total > 0 ? ((value / total) * 100).toFixed(0) : 0
            }));

            chartData.sort((a,b) => b.value - a.value);
            return { chartData, total };
        }
        
        const incomeData = processData('income');
        const expenseData = processData('expense');

        return { incomeData, expenseData };

    }, [transactions]);

    const noData = incomeData.chartData.length === 0 && expenseData.chartData.length === 0;

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Income vs. Expense Distribution</CardTitle>
                            <CardDescription>
                                A breakdown of your income and expenses for the current month by category.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            {noData ? (
                                <Alert className="mt-4">
                                    <ArrowRightLeft className="h-4 w-4" />
                                    <AlertTitle>No Data Available</AlertTitle>
                                    <AlertDescription>
                                        There are no transactions for the current month to display.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <div className="w-full grid md:grid-cols-2 gap-8">
                                    {incomeData.chartData.length > 0 ? (
                                        <PieChartComponent data={incomeData.chartData} title="Income Sources" total={incomeData.total} />
                                    ) : (
                                         <Alert className="mt-4 md:col-span-1">
                                            <AlertTitle>No Income Data</AlertTitle>
                                            <AlertDescription>No income recorded this month.</AlertDescription>
                                        </Alert>
                                    )}
                                    {expenseData.chartData.length > 0 ? (
                                        <PieChartComponent data={expenseData.chartData} title="Expense Categories" total={expenseData.total} />
                                     ) : (
                                        <Alert className="mt-4 md:col-span-1">
                                            <AlertTitle>No Expense Data</AlertTitle>
                                            <AlertDescription>No expenses recorded this month.</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
