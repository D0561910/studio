'use client';

import React, { useMemo } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/contexts/app-context';
import { formatCurrency } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export function SummaryCards() {
  const { transactions } = useAppContext();

  const summary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const balance = summary.income - summary.expense;

  const cards = [
    {
      title: 'Total Income',
      amount: summary.income,
      icon: <ArrowUpCircle className="h-4 w-4 text-green-500" />,
      amountClass: '',
    },
    {
      title: 'Total Expenses',
      amount: summary.expense,
      icon: <ArrowDownCircle className="h-4 w-4 text-red-500" />,
      amountClass: '',
    },
    {
      title: 'Balance',
      amount: balance,
      icon: <Scale className="h-4 w-4 text-muted-foreground" />,
      amountClass: balance >= 0 ? 'text-green-600' : 'text-red-600',
    },
  ];

  return (
    <>
      {/* Mobile View: Carousel */}
      <div className="md:hidden">
        <Carousel 
          className="w-full max-w-xs mx-auto"
          opts={{
            align: "start",
          }}
        >
          <CarouselContent>
            {cards.map((card, index) => (
              <CarouselItem key={index}>
                 <div className="p-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            {card.icon}
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.amountClass}`}>
                                {formatCurrency(card.amount)}
                            </div>
                        </CardContent>
                    </Card>
                 </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Desktop View: Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.amountClass}`}>
                {formatCurrency(card.amount)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
