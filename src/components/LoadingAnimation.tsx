
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  color?: "purple" | "blue";
  size?: "small" | "medium" | "large";
  className?: string;
}

const LoadingAnimation = ({ 
  color = "purple", 
  size = "medium",
  className
}: LoadingAnimationProps) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16"
  };

  const colorClass = color === "blue" ? "blue" : "";
  
  return (
    <div className={cn(
      "loader", 
      colorClass,
      sizeClasses[size],
      className
    )} />
  );
};

export default LoadingAnimation;
