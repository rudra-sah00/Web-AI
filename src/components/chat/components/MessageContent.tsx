"use client";

import React from 'react';
import CodeBlock from './CodeBlock';

interface MessageContentProps {
  content: string;
  className?: string;
}

export default function MessageContent({ content, className }: MessageContentProps) {
  // Parse the content to identify code blocks and format them properly
  const parseContent = (text: string) => {
    const parts: React.ReactElement[] = [];
    let currentIndex = 0;
    let partKey = 0;

    // Regex to match code blocks (```language\ncode\n```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    
    // Regex to match inline code (`code`)
    const inlineCodeRegex = /`([^`]+)`/g;

    let match;
    
    // Find all code blocks
    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before the code block
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push(
          <span key={partKey++} dangerouslySetInnerHTML={{ __html: formatInlineElements(beforeText) }} />
        );
      }

      // Add the code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      parts.push(
        <div key={partKey++} className="rounded-lg overflow-hidden -mx-2 my-2">
          <CodeBlock 
            code={code} 
            language={language}
            className="w-full"
          />
        </div>
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(
        <span key={partKey++} dangerouslySetInnerHTML={{ __html: formatInlineElements(remainingText) }} />
      );
    }

    return parts.length > 0 ? parts : [
      <span key={0} dangerouslySetInnerHTML={{ __html: formatInlineElements(text) }} />
    ];
  };

  // Format inline elements (bold, italic, inline code, links)
  const formatInlineElements = (text: string) => {
    return text
      // Bold text (**text** or __text__)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic text (*text* or _text_)
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Inline code (`code`)
      .replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  const parsedContent = parseContent(content);

  return (
    <div className={className}>
      {parsedContent}
    </div>
  );
}
