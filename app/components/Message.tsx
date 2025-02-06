// components/Message.tsx
import { Mail } from 'lucide-react'
import { Button } from './ui/button'

import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MessageProps {
  message: {
    role: string;
    content: string;
    emailDetails?: {
      mailto: string;
      subject: string;
      body: string;
    };
    includeEmailButton?: boolean;
  }
}

export function Message({ message }: MessageProps) {
  const renderContent = (content: string) => {
    // Split content into parts that might contain math expressions
    const parts = content.split(/((?:\\\[[\s\S]*?\\\])|(?:\\\(.*?\\\))|\*\*.*?\*\*)/g).filter(Boolean);
    
    return (
      <div>
        {parts.map((part, index) => {
          // Handle block math
          if (part.trim().startsWith('\\[') && part.trim().endsWith('\\]')) {
            const math = part.trim().slice(2, -2).trim();
            return <BlockMath key={index} math={math} />;
          }
          // Handle inline math
          if (part.startsWith('\\(') && part.endsWith('\\)')) {
            const math = part.slice(2, -2).trim();
            return <InlineMath key={index} math={math} />;
          }
          // Handle bold text
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
          }
          // Regular text - only create new paragraphs for double newlines
          return part.split(/\n\n+/).map((paragraph, pIndex) => (
            <p key={`${index}-${pIndex}`} className="mb-2">
              {paragraph.replace(/\n/g, ' ')}
            </p>
          ));
        })}
      </div>
    );
  };

  const handleEmailClick = () => {
    if (message.emailDetails) {
      const { mailto, subject, body } = message.emailDetails;
      window.location.href = `mailto:${mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[80%] rounded-lg p-3
        ${message.role === 'user' 
          ? 'bg-blue-500 text-white' 
          : message.role === 'assistant' 
            ? 'bg-gray-200 text-gray-800' 
            : 'bg-red-100 text-red-800'
        }
      `}>
        <p>{renderContent(message.content)}</p>
        {message.includeEmailButton && (
          <Button
            onClick={handleEmailClick}
            className="mt-2 bg-white text-blue-500 hover:bg-gray-100 flex items-center gap-2"
            size="sm"
          >
            <Mail className="h-4 w-4" />
            Email Roza
          </Button>
        )}
      </div>
    </div>
  )
}