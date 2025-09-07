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
import { Shapes } from 'lucide-react';

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


export default function CategoryDistributionPage() {
    const { transactions } = useAppContext();

    const spendingData = useMemo(() => {
        const currentMonthStart = startOfMonth(new Date());

        const monthlyExpenses = transactions.filter(t => 
            t.type === 'expense' && isSameMonth(new Date(t.date), currentMonthStart)
        );

        const distribution = monthlyExpenses.reduce((acc, curr) => {
            const key = curr.category;
            acc[key] = (acc[key] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        const totalSpending = Object.values(distribution).reduce((sum, amount) => sum + amount, 0);

        const chartData = Object.entries(distribution).map(([name, value]) => ({
            name,
            value,
            percentage: totalSpending > 0 ? ((value / totalSpending) * 100).toFixed(0) : 0
        }));
        
        chartData.sort((a, b) => b.value - a.value);

        return { chartData, totalSpending };

    }, [transactions]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Category Distribution</CardTitle>
                            <CardDescription>
                                A breakdown of your expenses for the current month by category.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center">
                            {spendingData.chartData.length > 0 ? (
                                <div className="w-full h-[400px] flex flex-col items-center">
                                     <div className="text-2xl font-bold mb-4">Total Spent: {formatCurrency(spendingData.totalSpending)}</div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={spendingData.chartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {spendingData.chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <Alert className="mt-4">
                                    <Shapes className="h-4 w-4" />
                                    <AlertTitle>No Spending Data Available</AlertTitle>
                                    <AlertDescription>
                                        There are no expense transactions for the current month to display.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
