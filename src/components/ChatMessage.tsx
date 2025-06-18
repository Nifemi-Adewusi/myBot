
import { Bot, User } from "lucide-react";
import MarkdownIt from 'markdown-it';
import { type ChatMessage as ChatMessageType } from "@/hooks/useGeminiChat";
import { useIsMobile } from "@/hooks/use-mobile";

const md = new MarkdownIt();

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex items-start gap-2 sm:gap-3 ${
      message.role === 'user' ? 'justify-end' : 'justify-start'
    }`}>
      {message.role === 'model' && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      )}
      <div className={`p-2 sm:p-4 rounded-2xl max-w-[85%] sm:max-w-[80%] ${
        message.role === 'user' 
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
          : 'bg-white shadow-md'
      }`}>
        {message.role === 'user' ? (
          <p className="text-sm sm:text-base">{message.parts}</p>
        ) : (
          <div 
            className="prose prose-sm max-w-none text-sm sm:text-base"
            dangerouslySetInnerHTML={{ __html: md.render(message.parts) }}
          />
        )}
      </div>
      {message.role === 'user' && (
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      )}
    </div>
  );
};
