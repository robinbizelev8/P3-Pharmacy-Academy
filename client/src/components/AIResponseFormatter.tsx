import { ReactNode } from 'react';

interface AIResponseFormatterProps {
  content: string;
  className?: string;
}

export function AIResponseFormatter({ content, className = '' }: AIResponseFormatterProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {content.split('\n\n').map((paragraph: string, pIndex: number) => {
        const trimmedParagraph = paragraph.trim();
        
        // Handle section headers with **text**:
        if (trimmedParagraph.match(/\*\*.*?\*\*:/)) {
          const parts = trimmedParagraph.split(/(\*\*.*?\*\*:)/);
          return (
            <div key={pIndex} className={`${pIndex > 0 ? 'mt-4' : ''}`}>
              {parts.map((part: string, partIndex: number) => {
                if (part.match(/\*\*.*?\*\*:/)) {
                  const headerText = part.replace(/\*\*/g, '').replace(':', '');
                  const isNextQuestion = headerText.toLowerCase().includes('next question');
                  return (
                    <div key={partIndex} className={`font-semibold mb-2 text-sm ${
                      isNextQuestion ? 'text-green-700 bg-green-50 p-2 rounded border-l-4 border-green-400' : 'text-blue-700'
                    }`}>
                      {headerText}
                    </div>
                  );
                } else if (part.trim()) {
                  return (
                    <p key={partIndex} className="text-gray-700">
                      {part.trim()}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          );
        }
        
        // Handle bullet points
        if (trimmedParagraph.match(/^[-•]/)) {
          return (
            <div key={pIndex} className={`${pIndex > 0 ? 'mt-2' : ''}`}>
              <p className="text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{trimmedParagraph.replace(/^[-•]\s*/, '')}</span>
              </p>
            </div>
          );
        }
        
        // Handle inline bold text **text** (not headers)
        if (trimmedParagraph.includes('**') && !trimmedParagraph.match(/\*\*.*?\*\*:/)) {
          const parts = trimmedParagraph.split(/(\*\*.*?\*\*)/);
          return (
            <p key={pIndex} className={`text-gray-700 ${pIndex > 0 ? 'mt-3' : ''}`}>
              {parts.map((part: string, partIndex: number) => {
                if (part.match(/\*\*.*?\*\*/)) {
                  const boldText = part.replace(/\*\*/g, '');
                  return <strong key={partIndex} className="font-bold text-gray-900">{boldText}</strong>;
                }
                return part;
              })}
            </p>
          );
        }
        
        // Regular paragraphs
        return (
          <p key={pIndex} className={`text-gray-700 ${pIndex > 0 ? 'mt-3' : ''}`}>
            {trimmedParagraph}
          </p>
        );
      })}
    </div>
  );
}