
import { useMemo } from "react";
import GeminiChat from "@/components/GeminiChat";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
  const timeBasedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return "Good Morning, Amazing Human";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon, Amazing Human";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening, Amazing Human";
    } else {
      return "Good Night, Amazing Human";
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-white to-blue-100 p-2 sm:p-4">
      <div className="container mx-auto py-4 sm:py-8">
        <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold text-center mb-4 sm:mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}>
          {timeBasedGreeting}
        </h1>
        <GeminiChat />
      </div>
    </div>
  );
};

export default Index;
