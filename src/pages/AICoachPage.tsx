import React from 'react';
import AICoachChat from '@/components/ai-coach/AICoachChat';

export default function AICoachPage() {
  return (
    <div className="h-[calc(100vh-80px)] md:h-screen bg-background-light dark:bg-background-dark">
      <AICoachChat />
    </div>
  );
}
