'use server';

/**
 * @fileOverview An AI agent that helps users create a reasonable budget plan based on their past income and spending data.
 *
 * - createBudget - A function that takes past financial data as input and returns a budget plan.
 * - CreateBudgetInput - The input type for the createBudget function.
 * - CreateBudgetOutput - The return type for the createBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateBudgetInputSchema = z.object({
  incomeData: z.string().describe('Past income data as a JSON string.'),
  spendingData: z.string().describe('Past spending data as a JSON string.'),
});
export type CreateBudgetInput = z.infer<typeof CreateBudgetInputSchema>;

const CreateBudgetOutputSchema = z.object({
  budgetPlan: z.string().describe('Suggested budget plan as a JSON string.'),
  flaggedOverspending: z.boolean().describe('Whether the user is overspending relative to past history.'),
});
export type CreateBudgetOutput = z.infer<typeof CreateBudgetOutputSchema>;

export async function createBudget(input: CreateBudgetInput): Promise<CreateBudgetOutput> {
  return createBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createBudgetPrompt',
  input: {schema: CreateBudgetInputSchema},
  output: {schema: CreateBudgetOutputSchema},
  prompt: `You are a personal finance expert. Analyze the user's past income and spending data and provide a reasonable budget plan.

  Income Data: {{{incomeData}}}
  Spending Data: {{{spendingData}}}

  Based on this information, create a budget plan and determine if the user is overspending relative to their past history.
  Return the budget plan as a JSON string.
`,
});

const createBudgetFlow = ai.defineFlow(
  {
    name: 'createBudgetFlow',
    inputSchema: CreateBudgetInputSchema,
    outputSchema: CreateBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
