
import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { toast } from "sonner";

export interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<ChatSession | null>(null);
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);
  const modelRef = useRef<any | null>(null);
  const lastRequestTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);

  // Rate limiting: minimum time between requests (in ms)
  const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests
  const MAX_RETRIES = 3;

  const initializeGemini = useCallback(async () => {
    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) {
        toast.error("Gemini API key is missing. Please add it to your environment variables.");
        return null;
      }

      // Create the GoogleGenerativeAI instance
      if (!genAIRef.current) {
        genAIRef.current = new GoogleGenerativeAI(apiKey);
      }
      
      // Get the model - using gemini-1.5-flash for better rate limits
      if (!modelRef.current) {
        modelRef.current = genAIRef.current.getGenerativeModel({ model: "gemini-1.5-flash" });
      }
      
      // Format the history for the chat
      const formattedHistory = messages.map(msg => ({ 
        role: msg.role, 
        parts: [{ text: msg.parts }] 
      }));
      
      // Create a new chat session
      const chat = modelRef.current.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024, // Reduced to stay within limits
        },
      });
      
      chatSessionRef.current = chat;
      console.log("Chat initialized successfully with history length:", formattedHistory.length);
      return chat;
    } catch (error) {
      console.error("Error initializing Gemini:", error);
      toast.error("Failed to initialize chat. Please try again.");
      return null;
    }
  }, [messages]);

  // Initialize Gemini when the component mounts
  useEffect(() => {
    initializeGemini();
  }, [initializeGemini]);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const sendMessageWithRetry = async (chatSession: ChatSession, input: string): Promise<string> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTimeRef.current;
    
    // Rate limiting: wait if we're sending requests too quickly
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before sending request`);
      await sleep(waitTime);
    }
    
    lastRequestTimeRef.current = Date.now();
    
    try {
      console.log("Sending message to chat session...");
      const result = await chatSession.sendMessage(input);
      const response = await result.response;
      const text = response.text();
      
      // Reset retry count on success
      retryCountRef.current = 0;
      return text;
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      
      // Check if it's a rate limit error (429)
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          
          // Extract retry delay from error or use exponential backoff
          let retryDelay = Math.pow(2, retryCountRef.current) * 5000; // 5s, 10s, 20s
          
          // Try to extract the suggested retry delay from the error
          const retryMatch = error.message?.match(/retryDelay[":]+(\d+)s/);
          if (retryMatch) {
            retryDelay = parseInt(retryMatch[1]) * 1000;
          }
          
          console.log(`Rate limit hit. Retrying in ${retryDelay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`);
          toast.error(`Rate limit reached. Retrying in ${Math.ceil(retryDelay/1000)} seconds...`);
          
          await sleep(retryDelay);
          return await sendMessageWithRetry(chatSession, input);
        } else {
          throw new Error("Rate limit exceeded. Please wait a few minutes before trying again.");
        }
      }
      
      throw error;
    }
  };

  const handleSubmit = async (input: string) => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = { role: 'user', parts: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Ensure chat session exists, reinitialize if needed
      let currentChatSession = chatSessionRef.current;
      if (!currentChatSession) {
        currentChatSession = await initializeGemini();
        if (!currentChatSession) {
          throw new Error("Failed to initialize chat session");
        }
      }
      
      // Send the message with retry logic
      const text = await sendMessageWithRetry(currentChatSession, input);
      
      // Add the AI response to the messages
      const aiMessage: ChatMessage = { role: 'model', parts: text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error getting response:", error);
      
      let errorText = "Sorry, I encountered an error. Please try again.";
      
      if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        errorText = "Rate limit exceeded. Please wait a few minutes before sending another message.";
        toast.error("Rate limit exceeded. Please wait a few minutes before trying again.");
      } else {
        toast.error("Failed to get response. Please try again.");
      }
      
      // Add an error message
      const errorMessage: ChatMessage = { 
        role: 'model', 
        parts: errorText
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Reset the chat session and force reinitialize for non-rate-limit errors
      if (!error.message?.includes('rate limit') && !error.message?.includes('quota')) {
        chatSessionRef.current = null;
        modelRef.current = null;
        initializeGemini();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit
  };
};
