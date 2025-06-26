import { Mic } from "lucide-react";

interface ConsultButtonProps {
  status: "not-started" | "active" | "inactive";
  onClick: () => void;
  disabled?: boolean;
}

export const ConsultButton: React.FC<ConsultButtonProps> = ({
  status,
  onClick,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 rounded-full p-8 transition-all duration-300
          ${status === "active" 
            ? "bg-green-100 animate-pulse" 
            : "bg-white hover:bg-green-50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <Mic className={`w-12 h-12 text-green-600 ${status === "active" ? "animate-bounce" : ""}`} />
      </button>
      {status === "active" && (
        <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping" />
      )}
    </div>
  );
};
