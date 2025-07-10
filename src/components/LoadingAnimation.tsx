import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  color?: "purple" | "blue" | "orange";
  size?: "small" | "medium" | "large";
  className?: string;
  variant?: "dots" | "pulse" | "neural" | "orbit";
}

const LoadingAnimation = ({ 
  color = "purple", 
  size = "medium",
  className,
  variant = "neural"
}: LoadingAnimationProps) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12", 
    large: "w-16 h-16"
  };
  
  const colorClasses = {
    blue: {
      primary: "bg-blue-500",
      secondary: "bg-blue-400", 
      accent: "bg-blue-300",
      glow: "shadow-blue-500/50"
    },
    orange: {
      primary: "bg-orange-500",
      secondary: "bg-orange-400",
      accent: "bg-orange-300", 
      glow: "shadow-orange-500/50"
    },
    purple: {
      primary: "bg-purple-500",
      secondary: "bg-purple-400",
      accent: "bg-purple-300",
      glow: "shadow-purple-500/50"
    }
  };

  const colors = colorClasses[color];

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

  // Default: Neural network variant
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
};

export default LoadingAnimation;