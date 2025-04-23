"use client";

import { PromptTemplate } from "./types";

interface PromptTemplatesProps {
  onSelectPrompt: (prompt: string) => void;
}

const promptTemplates: PromptTemplate[] = [
  {
    title: "Explain a concept",
    icon: "🧠",
    prompt: "Explain quantum computing in simple terms."
  },
  {
    title: "Write code",
    icon: "💻",
    prompt: "Write a function that calculates the Fibonacci sequence in JavaScript."
  },
  {
    title: "Draft an email",
    icon: "📧",
    prompt: "Draft a professional email requesting a meeting with a potential client."
  },
  {
    title: "Creative writing",
    icon: "✍️",
    prompt: "Write a short story about a time traveler who accidentally changes history."
  },
  {
    title: "Summarize text",
    icon: "📝",
    prompt: "Summarize the key points from this article: [paste your text here]"
  },
  {
    title: "Brainstorm ideas",
    icon: "💡",
    prompt: "Help me brainstorm 10 creative marketing ideas for a new coffee shop."
  }
];

export default function PromptTemplates({ onSelectPrompt }: PromptTemplatesProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Start a new conversation</h2>
        <p className="text-muted-foreground mt-2">Choose a template or ask your own question</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
        {promptTemplates.map((template, index) => (
          <div 
            key={index}
            className="border rounded-lg p-4 hover:bg-secondary/50 hover:shadow-md cursor-pointer transition-all duration-200 group"
            onClick={() => onSelectPrompt(template.prompt)}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{template.icon}</div>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">{template.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.prompt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}