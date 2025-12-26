import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  RefreshCw,
  Lightbulb,
  TrendingDown,
  Target,
  Shield,
  Calculator,
  PiggyBank,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';
import { sampleDebts, sampleGoals, sampleBudgets } from '@/lib/sampleData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  { icon: TrendingDown, text: "How can I pay off my debt faster?", category: "Debt" },
  { icon: Target, text: "Am I on track with my savings goals?", category: "Goals" },
  { icon: Shield, text: "Is my emergency fund sufficient?", category: "Safety" },
  { icon: Calculator, text: "How can I reduce my monthly expenses?", category: "Budget" },
  { icon: PiggyBank, text: "What if I lose my job? Help me plan.", category: "Scenario" },
  { icon: Lightbulb, text: "Give me a 30-day financial improvement plan", category: "Plan" },
];

export default function AICoachChat() {
  const { summary, currency, debts, goals, budgets } = useFinance();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const allMessages = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    const userContext = {
      summary,
      debts,
      goals,
      budgets,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-coach`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages, userContext }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsgId = `msg_${Date.now()}_assistant`;

      // Add empty assistant message
      setMessages(prev => [
        ...prev,
        { id: assistantMsgId, role: 'assistant', content: '', timestamp: new Date() },
      ]);

      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('AI Coach error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    streamChat(input.trim());
    setInput('');
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (isLoading) return;
    streamChat(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto bg-background-light dark:bg-background-dark shadow-2xl md:my-4 md:rounded-2xl overflow-hidden border border-border/50">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Financial Coach</h2>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMessages([])}
            className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-5 h-5 text-slate-500" />
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-6">
                <Bot className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">How can I help today?</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                I can analyze your spending, help with budgeting, or give investment tips.
              </p>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                {SUGGESTED_PROMPTS.slice(0, 4).map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestedPrompt(prompt.text)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface-dark border border-border/50 hover:border-primary/50 transition-all text-left shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                      <prompt.icon className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-sm font-medium">{prompt.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4 pb-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-sm'
                          : 'bg-white dark:bg-surface-dark border border-border/50 rounded-tl-sm'
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {line || '\u00A0'}
                          </p>
                        ))}
                      </div>
                      {message.role === 'assistant' && !message.content && isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-xs">Analyzing...</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/95 backdrop-blur border-t border-border">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-3xl border border-transparent focus-within:border-primary/30 transition-all">
          <Button
             type="button"
             variant="ghost"
             size="icon"
             className="rounded-full text-muted-foreground hover:text-foreground h-10 w-10 flex-shrink-0"
          >
             <Plus className="w-5 h-5" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 min-h-[40px] max-h-32 bg-transparent border-0 focus-visible:ring-0 resize-none py-2.5 px-2 text-sm"
            disabled={isLoading}
            rows={1}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 shadow-md flex-shrink-0 mb-0.5"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
