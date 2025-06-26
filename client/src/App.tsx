import React, { useEffect, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";
import { Mic, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegisterCallResponse {
  access_token: string;
  call_id: string;
  sampleRate: number;
}

const webClient = new RetellWebClient();

// Default API Key and Agent ID
const DEFAULT_API_KEY = "key_739b6a1ddbcb56a96028bff7089b";
const DEFAULT_AGENT_ID = "agent_a25b5d6506539a2e40f572407f";

const App = () => {
  const [callStatus, setCallStatus] = useState<"not-started" | "active" | "inactive">("not-started");
  const [callInProgress, setCallInProgress] = useState(false);
  const { toast } = useToast();

  // Extract API Key and Agent ID from URL or use defaults
  const urlParams = new URLSearchParams(window.location.search);
  const apiKey = urlParams.get("apiKey") || DEFAULT_API_KEY;
  const agentId = urlParams.get("agentId") || DEFAULT_AGENT_ID;

  useEffect(() => {
    webClient.on("conversationStarted", () => {
      console.log("Conversation started successfully");
      setCallStatus("active");
      setCallInProgress(false);
      toast({
        title: "Agent Activated",
        description: "You are now connected with your AI voice agent.",
      });
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Conversation ended with code:", code, "reason:", reason);
      setCallStatus("inactive");
      setCallInProgress(false);
      toast({
        title: "Agent Deactivated",
        description: "Your voice agent session has ended.",
      });
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setCallStatus("inactive");
      setCallInProgress(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred with the voice agent.",
      });
    });

    webClient.on("update", (update) => {
      console.log("Update received", update);
    });

    return () => {
      webClient.off("conversationStarted");
      webClient.off("conversationEnded");
      webClient.off("error");
      webClient.off("update");
    };
  }, [toast]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      return false;
    }
  };

  const toggleConversation = async () => {
    if (callInProgress) {
      return;
    }

    if (callStatus === "active") {
      try {
        setCallInProgress(true);
        await webClient.stopCall();
        setCallStatus("inactive");
      } catch (error) {
        console.error("Error stopping the call:", error);
      } finally {
        setCallInProgress(false);
      }
    } else {
      try {
        const hasMicPermission = await checkMicrophonePermission();
        if (!hasMicPermission) {
          toast({
            variant: "destructive",
            title: "Microphone Access Required",
            description: "Please allow microphone access to activate your agent.",
          });
          return;
        }
        setCallInProgress(true);
        await initiateConversation();
      } catch (error) {
        console.error("Error starting conversation:", error);
      } finally {
        setCallInProgress(false);
      }
    }
  };

  const initiateConversation = async () => {
    try {
      const registerCallResponse = await registerCall(agentId);
      if (!registerCallResponse.access_token || !registerCallResponse.call_id) {
        throw new Error("Missing required tokens");
      }

      await webClient.startCall({
        accessToken: registerCallResponse.access_token,
        sampleRate: registerCallResponse.sampleRate,
      });
      setCallStatus("active");
      toast({
        title: "Agent Activated",
        description: "You are now connected with your AI voice agent.",
      });
    } catch (error) {
      console.error("Error in registering or starting the call:", error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Failed to connect to the AI agent. Please try again.",
      });
      throw error;
    }
  };

  async function registerCall(agentId: string | null): Promise<RegisterCallResponse> {
    if (!agentId) {
      throw new Error("Agent ID is required");
    }
    
    console.log("Registering call for agent:", agentId);
    const sampleRate = parseInt(import.meta.env.VITE_RETELL_SAMPLE_RATE || "16000", 10);

    try {
      const response = await fetch("https://api.retellai.com/v2/create-web-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Call registered successfully:", data);

      return {
        access_token: data.access_token,
        call_id: data.call_id,
        sampleRate: sampleRate,
      };
    } catch (err) {
      console.error("Error registering call:", err);
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-3">
          <img 
            src="/WhatsApp Image 2025-06-25 at 21.01.22.jpeg" 
            alt="FINEX Logo" 
            className="w-12 h-12 object-contain"
          />
          <span className="text-2xl font-bold tracking-wider">FINEX</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8 text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">The Agent</a>
          <a href="#" className="hover:text-white transition-colors">Industries</a>
          <a href="#" className="hover:text-white transition-colors">FAQs</a>
          <a href="#" className="hover:text-white transition-colors">Trailer</a>
        </div>

        <div className="flex items-center space-x-2 border border-gray-600 rounded-lg px-3 py-2">
          <Globe className="w-4 h-4" />
          <span className="text-sm">Eng...</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* Hero Image */}
        <div className="mb-8">
          <img 
            src="/WhatsApp Image 2025-06-25 at 21.01.23.jpeg" 
            alt="FINEX AI Agent" 
            className="w-64 h-auto object-contain"
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl font-light text-center mb-8 leading-tight">
          Your Voice. <span className="text-gray-400">At Scale.</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-300 text-center max-w-4xl mb-12 leading-relaxed">
          Finex builds enterprise-grade AI voice agents trained to speak in your voice and close like your best rep. Fully branded. Fully autonomous. Working 24/7.
        </p>

        {/* Microphone Button */}
        <div className="mb-12">
          <div className="relative">
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl scale-150"></div>
            
            {/* Microphone container */}
            <div className="relative">
              <button
                onClick={toggleConversation}
                disabled={callInProgress}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  callStatus === "active"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } ${callInProgress ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
              >
                <Mic className={`w-12 h-12 text-white ${callStatus === "active" ? "animate-bounce" : ""}`} />
              </button>
            </div>

            {/* Active state animation */}
            {callStatus === "active" && (
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping scale-125"></div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={toggleConversation}
            disabled={callInProgress}
            className={`px-8 py-4 rounded-full font-medium text-lg transition-all duration-200 ${
              callStatus === "active"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } ${callInProgress ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
          >
            {callStatus === "active" ? "Deactivate Agent" : "Activate My Agent"}
          </button>

          <button className="px-8 py-4 rounded-full font-medium text-lg border-2 border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-all duration-200 hover:scale-105">
            Watch Trailer
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;