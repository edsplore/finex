import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg transition-transform hover:scale-105">
      <div className="flex flex-col items-center text-center space-y-4">
        <Icon className="w-12 h-12 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
};
