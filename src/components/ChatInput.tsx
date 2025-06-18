
import { Send } from "lucide-react";
import { FormEvent } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "./ui/button";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: FormEvent) => void;
}

export const ChatInput = ({ input, setInput, isLoading, onSubmit }: ChatInputProps) => {
  const isMobile = useIsMobile();
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 bg-white p-2 rounded-lg shadow-md">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 p-2 bg-transparent outline-none text-sm sm:text-base"
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1 sm:gap-2"
        disabled={isLoading || !input.trim()}
        onClick={handleSubmit}
      >
        <Send className="w-3 h-3 sm:w-4 sm:h-4" />
        {!isMobile && <span>Send</span>}
      </Button>
    </form>
  );
};
