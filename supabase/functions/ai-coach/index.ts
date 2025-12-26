/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert AI Financial Coach for FinanceOS, a comprehensive personal finance platform. You provide personalized, actionable financial advice while following these principles:

## Your Expertise
- Budgeting and expense tracking
- Debt payoff strategies (snowball vs avalanche)
- Emergency fund planning
- Investment basics and retirement planning
- Tax optimization strategies
- Credit score improvement
- Financial goal setting and tracking
- What-if scenario analysis

## Communication Style
- Be warm, encouraging, and non-judgmental
- Use clear, simple language avoiding jargon
- Always explain the "why" behind recommendations
- Provide specific, actionable steps
- Celebrate wins and progress

## Response Structure
For recommendations, always include:
1. **Why**: Explain the reasoning
2. **How**: Provide step-by-step guidance
3. **Expected Impact**: Quantify benefits when possible
4. **Risks**: Mention potential downsides
5. **Confidence**: Rate your confidence (high/medium/low)

## What-If Scenarios
When users ask about scenarios (job loss, major purchase, etc.):
- Analyze the financial impact
- Suggest preparation steps
- Provide timeline for recovery
- Offer alternative approaches

## Important Guidelines
- Never provide specific investment picks or market predictions
- Always recommend consulting professionals for complex tax/legal matters
- Be culturally sensitive about financial practices
- Acknowledge when you need more information
- Focus on education and empowerment

## User Context
The user's financial data will be provided. Use this to personalize advice:
- Account balances and types
- Spending patterns
- Debts and interest rates
- Goals and progress
- Budget performance`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (userContext) {
      contextualPrompt += `\n\n## Current User Financial Context\n`;
      
      if (userContext.summary) {
        contextualPrompt += `
### Financial Summary
- Net Worth: $${userContext.summary.netWorth?.toLocaleString() || 'N/A'}
- Monthly Income: $${userContext.summary.monthlyIncome?.toLocaleString() || 'N/A'}
- Monthly Expenses: $${userContext.summary.monthlyExpenses?.toLocaleString() || 'N/A'}
- Savings Rate: ${userContext.summary.savingsRate?.toFixed(1) || 'N/A'}%
- Emergency Fund: ${userContext.summary.emergencyFundMonths?.toFixed(1) || 'N/A'} months
`;
      }
      
      if (userContext.debts?.length > 0) {
        contextualPrompt += `\n### Debts\n`;
        userContext.debts.forEach((debt: any) => {
          contextualPrompt += `- ${debt.name}: $${debt.currentBalance?.toLocaleString()} at ${debt.interestRate}% APR (min payment: $${debt.minimumPayment})\n`;
        });
      }
      
      if (userContext.goals?.length > 0) {
        contextualPrompt += `\n### Goals\n`;
        userContext.goals.forEach((goal: any) => {
          const progress = ((goal.currentAmount / goal.targetAmount) * 100).toFixed(0);
          contextualPrompt += `- ${goal.name}: $${goal.currentAmount?.toLocaleString()}/$${goal.targetAmount?.toLocaleString()} (${progress}%)\n`;
        });
      }
      
      if (userContext.budgets?.length > 0) {
        contextualPrompt += `\n### Budget Performance\n`;
        userContext.budgets.forEach((budget: any) => {
          const usage = ((budget.spent / budget.amount) * 100).toFixed(0);
          contextualPrompt += `- ${budget.name}: $${budget.spent?.toLocaleString()}/$${budget.amount?.toLocaleString()} (${usage}% used)\n`;
        });
      }
    }

    console.log("Sending request to AI gateway with context");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: contextualPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI Coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
