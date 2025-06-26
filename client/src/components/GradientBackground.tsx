import { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-green-100 to-green-200 opacity-90" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzIyYzU1ZSIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-20" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
