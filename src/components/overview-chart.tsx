'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { subDays, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';
import { useAppContext } from '@/contexts/app-context';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export function OverviewChart() {
  const { transactions } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [skeletonHeights, setSkeletonHeights] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 750);
    // Generate random heights only on the client, after the component has mounted
    setSkeletonHeights(Array.from({ length: 7 }, () => Math.random() * 80 + 10));
    return () => clearTimeout(timer);
  }, []);

  const data = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    return days.map(day => {
      const formattedDate = format(day, 'MMM d');
      const dailyTransactions = transactions.filter(
        t => format(new Date(t.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );
      return {
        date: formattedDate,
        income: dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expense: dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      };
    });
  }, [transactions]);

  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full flex items-end gap-2 px-4">
                    {skeletonHeights.length > 0 ? skeletonHeights.map((height, i) => (
                        <Skeleton key={i} className="h-full w-full" style={{height: `${height}%`}} />
                    )) : Array.from({ length: 7 }).map((_,i) => <Skeleton key={i} className="h-full w-full" />)}
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Income and expenses for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              content={<ChartTooltipContent formatter={(value, name) => <span>{`${name.charAt(0).toUpperCase() + name.slice(1)}: ${formatCurrency(Number(value))}`}</span>} />}
            />
            <Bar dataKey="income" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expense" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
