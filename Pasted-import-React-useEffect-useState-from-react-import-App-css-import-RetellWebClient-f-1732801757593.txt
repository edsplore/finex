import React, { useEffect, useState } from "react";
import "./App.css";
import { RetellWebClient } from "retell-client-js-sdk";
import { Mic, X } from "lucide-react";
import { BiChat, BiMenu } from "react-icons/bi"; // Importing the icons

interface RegisterCallResponse {
  access_token?: string;
  callId?: string;
  sampleRate: number;
}

const webClient = new RetellWebClient();

const GradientBackground: React.FC = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-white opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-gray-100 to-transparent opacity-50"></div>
      <div className="absolute inset-0">
        <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgxMzUpIj48bGluZSB4MT0iMCIgeT0iMCIgeDI9IjQwIiB5Mj0iNDAiIHN0cm9rZT0iIzAwMDAwMCIgc3Ryb2tlLXdpZHRoPSIxIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-10"></div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};

const App = () => {
  const [callStatus, setCallStatus] = useState<"not-started" | "active" | "inactive">("not-started");
  const [callInProgress, setCallInProgress] = useState(false); // Flag to track call setup progress
  const [showMenu, setShowMenu] = useState(false);

  // UseEffect for initializing the WebClient and adding error handling
  useEffect(() => {
    // Adding event listeners for the webClient
    webClient.on("conversationStarted", () => {
      console.log("Conversation started successfully");
      setCallStatus("active");
      setCallInProgress(false); // Reset flag after conversation starts
    });

    webClient.on("conversationEnded", ({ code, reason }) => {
      console.log("Conversation ended with code:", code, "reason:", reason);
      setCallStatus("inactive");
      setCallInProgress(false); // Reset flag after conversation ends
    });

    webClient.on("error", (error) => {
      console.error("An error occurred:", error);
      setCallStatus("inactive");
      setCallInProgress(false); // Reset flag on error
      // No runtime errors are shown to the user
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
  }, []);

  const toggleConversation = async () => {
    if (callInProgress) {
      return; // Prevent multiple calls if call is in progress
    }

    setCallInProgress(true); // Set the flag when call starts

    if (callStatus === "active") {
      // Stop the call when active
      try {
        await webClient.stopCall(); // Ensure the stop call is awaited properly
        setCallStatus("inactive");
      } catch (error) {
        console.error("Error stopping the call:", error);
      } finally {
        setCallInProgress(false); // Reset flag after stopping
      }
    } else {
      // Try starting the conversation when inactive or not started
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        // Start the conversation
        await initiateConversation();
      } catch (error) {
        console.error("Microphone permission denied or error occurred:", error);
        // Do not show any runtime errors to the user
      } finally {
        setCallInProgress(false); // Reset flag whether call starts or fails
      }
    }
  };

  const initiateConversation = async () => {
    const agentId = "agent_a24294c8982b75e8fbeb46b7ba"; // Default agent ID
    try {
      const registerCallResponse = await registerCall(agentId);
      if (registerCallResponse.callId) {
        await webClient.startCall({
          accessToken: registerCallResponse.access_token,
          callId: registerCallResponse.callId,
          sampleRate: registerCallResponse.sampleRate,
          enableUpdate: true,
        });
        setCallStatus("active");
      }
    } catch (error) {
      console.error("Error in registering or starting the call:", error);
      // Do not show any runtime errors to the user
    }
  };

  // Function for registering a call
  async function registerCall(agentId: string): Promise<RegisterCallResponse> {
    console.log("Registering call for agent:", agentId);

    const apiKey = "key_739b6a1ddbcb56a96028bff7089b"; // Replace with your real API key
    const sampleRate = parseInt(process.env.REACT_APP_RETELL_SAMPLE_RATE || "16000", 10);

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
        callId: data.call_id,
        sampleRate: sampleRate,
      };
    } catch (err) {
      console.error("Error registering call:", err);
      throw err; // Re-throw the error to be handled in the caller
    }
  }

  return (
    <GradientBackground>
      <div className="min-h-screen flex flex-col font-sans">
        <div className="text-3xl font-bold text-green-700 font-serif p-4 absolute top-0 left-0">
          Foodie Bot
        </div>
        <main className="flex-grow flex flex-col items-center justify-center p-4 text-center relative">
          <img src="/Cafe_India_Logo_Transparent.png" alt="Cafe India Logo" className="w-32 h-32 mb-4" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-green-800 font-serif">Cafe India's Menu Assistant</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl text-gray-700 font-light">Siri for Restaurant Menu</p>

          <div className="relative mb-8">
            <div
              className={`relative z-10 bg-green-600 rounded-full p-8 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 ${
                callStatus === "active" ? "bg-red-600" : ""
              }`}
              onClick={toggleConversation}
            >
              <Mic className={`w-16 h-16 text-white ${callStatus === "active" ? "animate-bounce" : ""}`} />
            </div>
            {callStatus === "active" && (
              <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping"></div>
            )}
          </div>

          {/* Buttons - Chat and Show Menu aligned */}
          <div className="flex space-x-4 justify-center mt-4">
            <button
              className={`border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-full transition duration-300 ease-in-out shadow-md font-medium flex items-center ${
                callInProgress ? "opacity-50 cursor-not-allowed" : ""
              }`} // Disable during call setup
              onClick={() =>
                !callInProgress &&
                (window.location.href =
                  "https://creator.voiceflow.com/prototype/6715666db2c68d651862357a")
              }
              disabled={callInProgress}
            >
              <BiChat className="mr-2" /> Chat Now!
            </button>

            <button
              className={`border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-full transition duration-300 ease-in-out shadow-md font-medium flex items-center ${
                callInProgress ? "opacity-50 cursor-not-allowed" : ""
              }`} // Disable during call setup
              onClick={() => !callInProgress && (window.location.href = "https://nalasusa.com/")}
              disabled={callInProgress}
            >
              <BiMenu className="mr-2" /> Show Menu
            </button>
          </div>

          {showMenu && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="relative bg-white rounded-lg shadow-xl p-6 m-4 max-w-4xl w-full h-5/6 overflow-hidden flex flex-col">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowMenu(false)}
                >
                  <X className="h-6 w-6" />
                </button>
                <h2 className="text-3xl font-bold text-green-800 mb-4">Cafe India's Menu</h2>
                <div className="overflow-y-auto flex-grow">
                  <RestaurantMenu />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </GradientBackground>
  );
};

const RestaurantMenu = () => (
  <div className="text-left space-y-8">
    {/* Menu sections can be added here */}
  </div>
);

export default App;
