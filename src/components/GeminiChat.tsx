
import { useRef, FormEvent, useEffect } from 'react';
import { MessageCircle, Bot } from "lucide-react";
import { useGeminiChat } from "@/hooks/useGeminiChat";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useIsMobile } from "@/hooks/use-mobile";

const GeminiChat = () => {
  const isMobile = useIsMobile();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { messages, input, setInput, isLoading, handleSubmit } = useGeminiChat();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[80vh] w-full max-w-4xl mx-auto bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-xl p-3 sm:p-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-6">
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Chat Assistant
        </h1>
      </div>
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto mb-3 sm:mb-4 space-y-3 sm:space-y-4 pr-2 sm:pr-4"
      >
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        {isLoading && (
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ChatInput 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default GeminiChat;
