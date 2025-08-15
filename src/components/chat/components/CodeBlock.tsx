"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export default function CodeBlock({ code, language = "text", filename, className }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Clean up the language identifier
  const cleanLanguage = language.toLowerCase().replace(/^language-/, '');

  return (
    <div className={cn("relative group", className)}>
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between bg-gray-900 px-3 py-2 rounded-t-lg border-b border-gray-600">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-xs text-gray-300 font-medium">{filename}</span>
          )}
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded font-mono">
            {cleanLanguage}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 w-6 p-0 hover:bg-gray-700 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy code"
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-green-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {/* Code content */}
      <div className="relative overflow-x-auto">
        <SyntaxHighlighter
          language={cleanLanguage}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 0.5rem 0.5rem',
            background: '#0d1117',
            padding: '0.75rem',
            fontSize: '0.8rem',
            lineHeight: '1.4',
          }}
          showLineNumbers={code.split('\n').length > 3}
          lineNumberStyle={{
            color: '#6b7280',
            fontSize: '0.7rem',
            paddingRight: '0.75rem',
            minWidth: '2rem',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
