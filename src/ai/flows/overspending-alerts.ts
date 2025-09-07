'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting overspending in user-defined categories.
 *
 * The flow takes user's expense data and budget plan and returns a list of alerts if the spending
 * exceeds the budget by a predefined threshold.
 *
 * - `overspendingAlerts` - A function that triggers the overspending alerts flow.
 * - `OverspendingAlertsInput` - The input type for the `overspendingAlerts` function.
 * - `OverspendingAlertsOutput` - The return type for the `overspendingAlerts` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpenseSchema = z.object({
  category: z.string().describe('The category of the expense.'),
  amount: z.number().describe('The amount of the expense.'),
  date: z.string().describe('The date of the expense (YYYY-MM-DD).'),
});

export type Expense = z.infer<typeof ExpenseSchema>;

const BudgetSchema = z.object({
  category: z.string().describe('The category of the budget.'),
  amount: z.number().describe('The budgeted amount for the category.'),
});

export type Budget = z.infer<typeof BudgetSchema>;

const OverspendingAlertsInputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('An array of expenses.'),
  budget: z.array(BudgetSchema).describe('An array of budget items.'),
  threshold: z
    .number()
    .default(0.1)
    .describe(
      'The threshold percentage (e.g., 0.1 for 10%) above which an alert should be triggered.'
    ),
});

export type OverspendingAlertsInput = z.infer<typeof OverspendingAlertsInputSchema>;

const OverspendingAlertSchema = z.object({
  category: z.string().describe('The category where overspending occurred.'),
  overspentAmount: z.number().describe('The amount overspent in the category.'),
  budgetName: z.string().optional().describe('The name of the budget.'),
});

export type OverspendingAlert = z.infer<typeof OverspendingAlertSchema>;

const OverspendingAlertsOutputSchema = z.array(OverspendingAlertSchema);

export type OverspendingAlertsOutput = z.infer<typeof OverspendingAlertsOutputSchema>;

export async function overspendingAlerts(input: OverspendingAlertsInput): Promise<OverspendingAlertsOutput> {
  return overspendingAlertsFlow(input);
}

const overspendingAlertsPrompt = ai.definePrompt({
  name: 'overspendingAlertsPrompt',
  input: {schema: OverspendingAlertsInputSchema},
  output: {schema: OverspendingAlertsOutputSchema},
  prompt: `You are an AI assistant helping users track their spending and identify potential overspending issues.

  Given the user's expense data and budget plan, your task is to identify categories where the user has exceeded their budget by a specified threshold.

  Expenses:
  {{#each expenses}}
  - Category: {{this.category}}, Amount: {{this.amount}}, Date: {{this.date}}
  {{/each}}

  Budget:
  {{#each budget}}
  - Category: {{this.category}}, Amount: {{this.amount}}
  {{/each}}

  Threshold: {{threshold}} ({{threshold}} above the budgeted amount).

  Identify any categories where the total expenses exceed the budgeted amount by the specified threshold.

  Return a list of alerts, each including the category, the amount overspent, and the budget name (if available).

  Output format: array of OverspendingAlert objects.
`,
});

const overspendingAlertsFlow = ai.defineFlow(
  {
    name: 'overspendingAlertsFlow',
    inputSchema: OverspendingAlertsInputSchema,
    outputSchema: OverspendingAlertsOutputSchema,
  },
  async input => {
    const {
      expenses,
      budget,
      threshold,
    } = input;

    const categorySpending: { [category: string]: number } = {};
    expenses.forEach(expense => {
      if (!categorySpending[expense.category]) {
        categorySpending[expense.category] = 0;
      }
      categorySpending[expense.category] += expense.amount;
    });

    const alerts: OverspendingAlert[] = [];

    budget.forEach(budgetItem => {
      const category = budgetItem.category;
      const budgetedAmount = budgetItem.amount;
      const totalSpent = categorySpending[category] || 0;

      if (totalSpent > budgetedAmount * (1 + threshold)) {
        alerts.push({
          category: category,
          overspentAmount: totalSpent - budgetedAmount,
          budgetName: budgetItem.category,
        });
      }
    });

    return alerts;

  }
);
