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
                  return (
                    <div key={partIndex} className="font-semibold text-blue-700 mb-2 text-sm">
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
        
        // Handle numbered lists
        if (trimmedParagraph.match(/^\d+\./)) {
          return (
            <div key={pIndex} className={`${pIndex > 0 ? 'mt-3' : ''}`}>
              <p className="text-gray-700">{trimmedParagraph}</p>
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