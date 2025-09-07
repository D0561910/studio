
'use server';

/**
 * @fileOverview An AI agent that analyzes expense patterns.
 *
 * - analyzeExpenses - Analyzes transactions to identify spending habits and fees.
 * - ExpenseAnalysisInput - The input type for the analyzeExpenses function.
 * - ExpenseAnalysisOutput - The return type for the analyzeExpenses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExpenseAnalysisInputSchema = z.object({
  transactions: z.string().describe('A JSON string of expense transactions.'),
});
export type ExpenseAnalysisInput = z.infer<typeof ExpenseAnalysisInputSchema>;

const ExpenseAnalysisOutputSchema = z.object({
  totalExpenses: z.number().describe('The total amount of expenses.'),
  totalFees: z.number().describe('The total amount of identified credit card fees. Look for transactions with categories like "Fees", "Interest", or similar.'),
  expensesByCategory: z.record(z.number()).describe('A dictionary mapping expense categories to their total amounts.'),
  insights: z.string().describe('Actionable insights and a brief summary of spending habits based on the data.'),
});
export type ExpenseAnalysisOutput = z.infer<typeof ExpenseAnalysisOutputSchema>;

export async function analyzeExpenses(input: ExpenseAnalysisInput): Promise<ExpenseAnalysisOutput> {
  return expenseAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expenseAnalysisPrompt',
  input: { schema: ExpenseAnalysisInputSchema },
  output: { schema: ExpenseAnalysisOutputSchema },
  prompt: `You are a financial analyst. Analyze the user's expense transactions.

  Transactions Data: {{{transactions}}}

  Based on this data, calculate the total expenses, identify any credit card fees (look for transactions with categories like 'Fee', 'Interest', 'Late Fee'), summarize expenses by category, and provide a brief, actionable insight into the user's spending habits.
`,
});

const expenseAnalysisFlow = ai.defineFlow(
  {
    name: 'expenseAnalysisFlow',
    inputSchema: ExpenseAnalysisInputSchema,
    outputSchema: ExpenseAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
