'use server';

/**
 * @fileOverview An AI agent that analyzes credit card spending patterns.
 *
 * - analyzeCreditSpending - Analyzes credit transactions to identify spending habits and fees.
 * - CreditAnalysisInput - The input type for the analyzeCreditSpending function.
 * - CreditAnalysisOutput - The return type for the analyzeCreditSpending function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const CreditAnalysisInputSchema = z.object({
  transactions: z.string().describe('A JSON string of credit expense transactions.'),
});
export type CreditAnalysisInput = z.infer<typeof CreditAnalysisInputSchema>;

const CreditAnalysisOutputSchema = z.object({
  totalExpenses: z.number().describe('The total amount of credit expenses.'),
  totalFees: z.number().describe('The total amount of identified credit card fees. Look for transactions with categories like "Fees", "Interest", or similar.'),
  expensesByCategory: z.record(z.number()).describe('A dictionary mapping expense categories to their total amounts.'),
  insights: z.string().describe('Actionable insights and a brief summary of spending habits based on the data.'),
});
export type CreditAnalysisOutput = z.infer<typeof CreditAnalysisOutputSchema>;

export async function analyzeCreditSpending(input: CreditAnalysisInput): Promise<CreditAnalysisOutput> {
  return creditAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creditAnalysisPrompt',
  input: { schema: CreditAnalysisInputSchema },
  output: { schema: CreditAnalysisOutputSchema },
  prompt: `You are a financial analyst specializing in credit card spending. Analyze the user's credit expense transactions.

  Transactions Data: {{{transactions}}}

  Based on this data, calculate the total expenses, identify any credit card fees (look for categories like 'Fee', 'Interest', 'Late Fee'), summarize expenses by category, and provide a brief, actionable insight into the user's spending habits.
`,
});

const creditAnalysisFlow = ai.defineFlow(
  {
    name: 'creditAnalysisFlow',
    inputSchema: CreditAnalysisInputSchema,
    outputSchema: CreditAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
