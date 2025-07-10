import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  color?: "purple" | "blue" | "teal" | "orange" | "indigo" | "cyan";
  size?: "small" | "medium" | "large";
  className?: string;
  variant?: "dots" | "pulse" | "neural" | "orbit" | "prism";
}

const LoadingAnimation = ({ 
  color = "teal", 
  size = "medium",
  className,
  variant = "prism"
}: LoadingAnimationProps) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };
  
  const colorClasses: Record<string, {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    spectrum: string[];
  }> = {
    teal: {
      primary: "bg-prism-primary",
      secondary: "bg-prism-primary-light", 
      accent: "bg-prism-primary-light",
      glow: "shadow-prism-primary/50",
      spectrum: ["#00C2A8", "#1DD1B8", "#5EEAD4", "#A7F3EB"]
    },
    blue: {
      primary: "bg-blue-500",
      secondary: "bg-blue-400",
      accent: "bg-blue-300", 
      glow: "shadow-blue-500/50",
      spectrum: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"]
    },
    cyan: {
      primary: "bg-cyan-500",
      secondary: "bg-cyan-400",
      accent: "bg-cyan-300", 
      glow: "shadow-cyan-500/50",
      spectrum: ["#06B6D4", "#22D3EE", "#67E8F9", "#CFFAFE"]
    },
    indigo: {
      primary: "bg-indigo-500",
      secondary: "bg-indigo-400",
      accent: "bg-indigo-300", 
      glow: "shadow-indigo-500/50",
      spectrum: ["#6366F1", "#818CF8", "#A5B4FC", "#C7D2FE"]
    },
    purple: {
      primary: "bg-prism-accent",
      secondary: "bg-prism-accent-light",
      accent: "bg-prism-accent-light",
      glow: "shadow-prism-accent/50",
      spectrum: ["#9B5DE5", "#B47EE8", "#C9A0ED", "#E2CFF5"]
    },
    orange: {
      primary: "bg-orange-500",
      secondary: "bg-orange-400",
      accent: "bg-orange-300",
      glow: "shadow-orange-500/50",
      spectrum: ["#F97316", "#FB923C", "#FDBA74", "#FED7AA"]
    }
  };

  // Fix: Ensure colors is always defined by providing a fallback
  const colors = colorClasses[color] || colorClasses.teal || {
    primary: "bg-prism-primary",
    secondary: "bg-prism-primary-light",
    accent: "bg-prism-primary-light",
    glow: "shadow-prism-primary/50",
    spectrum: ["#00C2A8", "#1DD1B8", "#5EEAD4", "#A7F3EB"]
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex items-center justify-center gap-1", sizeClasses[size], className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full",
              colors.primary,
              "animate-pulse"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.4s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className={cn(
          "absolute inset-0 rounded-full",
          colors.primary,
          "animate-ping opacity-75"
        )} />
        <div className={cn(
          "relative w-full h-full rounded-full",
          colors.primary,
          "animate-pulse"
        )} />
      </div>
    );
  }

  if (variant === "orbit") {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        {/* Central core */}
        <div className={cn(
          "absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full",
          colors.primary,
          "animate-pulse"
        )} />
        
        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 animate-spin"
            style={{
              animationDuration: `${2 + i * 0.5}s`,
              animationDelay: `${i * 0.3}s`
            }}
          >
            <div className={cn(
              "w-1.5 h-1.5 rounded-full",
              i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
              "absolute top-0 left-1/2 -translate-x-1/2"
            )} />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "neural") {
    return (
      <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
        {/* Neural network nodes */}
        <div className="relative w-full h-full">
          {/* Center node */}
          <div className={cn(
            "absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full",
            colors.primary,
            "animate-pulse shadow-lg",
            colors.glow
          )} />
          
          {/* Surrounding nodes */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * 60) * (Math.PI / 180);
            const radius = size === "small" ? 12 : size === "medium" ? 16 : 20;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <div
                key={i}
                className={cn(
                  "absolute w-2 h-2 rounded-full",
                  colors.secondary,
                  "animate-pulse"
                )}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: "2s"
                }}
              />
            );
          })}
          
          {/* Connection lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * 60) * (Math.PI / 180);
            const length = size === "small" ? 12 : size === "medium" ? 16 : 20;
            
            return (
              <div
                key={`line-${i}`}
                className={cn(
                  "absolute w-px opacity-30",
                  colors.accent,
                  "animate-pulse"
                )}
                style={{
                  left: '50%',
                  top: '50%',
                  height: `${length}px`,
                  transformOrigin: 'top center',
                  transform: `rotate(${i * 60}deg)`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "3s"
                }}
              />
            );
          })}
          
          {/* Outer ring */}
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-dashed opacity-20",
            `border-${color}-400`,
            "animate-spin"
          )} 
          style={{ animationDuration: "8s" }} />
          
          {/* Inner ring */}
          <div className={cn(
            "absolute inset-2 rounded-full border border-solid opacity-30",
            `border-${color}-300`,
            "animate-spin"
          )} 
          style={{ 
            animationDuration: "4s",
            animationDirection: "reverse"
          }} />
        </div>
        
        {/* Pulsing glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full opacity-20 animate-ping",
          colors.primary
        )} 
        style={{ animationDuration: "3s" }} />
      </div>
    );
  }

  // Default: Prism-inspired animation
  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <div className="relative w-full h-full">
        {/* Central prism shape */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 prism-shape"
          style={{
            width: size === "small" ? "16px" : size === "medium" ? "20px" : "24px",
            height: size === "small" ? "14px" : size === "medium" ? "18px" : "22px",
            background: `linear-gradient(135deg, ${colors.spectrum[0]}, ${colors.spectrum[1]})`,
            clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
            animation: "prism-pulse 2s ease-in-out infinite"
          }}
        />
        
        {/* Light rays emanating from prism */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * 60) * (Math.PI / 180);
          const length = size === "small" ? 18 : size === "medium" ? 24 : 30;
          const colorIndex = i % colors.spectrum.length;
          
          return (
            <div
              key={`ray-${i}`}
              className="absolute prism-ray"
              style={{
                left: '50%',
                top: '50%',
                width: '2px',
                height: `${length}px`,
                background: `linear-gradient(to bottom, ${colors.spectrum[colorIndex]}, transparent)`,
                transformOrigin: 'top center',
                transform: `rotate(${i * 60}deg)`,
                opacity: 0.7,
                animation: `prism-ray-${i} 3s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          );
        })}
        
        {/* Spectral particles */}
        {colors.spectrum.map((spectrumColor, i) => {
          const angle = (i * 90) * (Math.PI / 180);
          const radius = size === "small" ? 14 : size === "medium" ? 18 : 22;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full prism-particle"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: spectrumColor,
                boxShadow: `0 0 6px ${spectrumColor}`,
                animation: `prism-particle-${i} 2.5s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          );
        })}
        
        {/* Rotating light beam */}
        <div 
          className="absolute inset-0 prism-beam"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${colors.spectrum[0]}20, transparent)`,
            borderRadius: '50%',
            animation: "prism-rotate 4s linear infinite"
          }}
        />
        
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full prism-glow"
          style={{
            background: `radial-gradient(circle, transparent 60%, ${colors.spectrum[0]}10, transparent)`,
            animation: "prism-glow 3s ease-in-out infinite"
          }}
        />
      </div>
    </div>
  );
};

export default LoadingAnimation;