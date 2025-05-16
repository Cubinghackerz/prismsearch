
import { cn } from "@/lib/utils";

interface LoadingAnimationProps {
  color?: "purple" | "blue" | "orange";
  size?: "small" | "medium" | "large";
  className?: string;
}

const LoadingAnimation = ({ 
  color = "purple", 
  size = "medium",
  className
}: LoadingAnimationProps) => {
  const sizeClasses = {
    small: "w-6 h-5.2", // Adjusted height to maintain aspect ratio
    medium: "w-10 h-8.66", // Adjusted height to maintain aspect ratio
    large: "w-16 h-13.86" // Adjusted height to maintain aspect ratio
  };
  
  // Color based on theme
  const colorClass = 
    color === "blue" ? "bg-blue-500" : 
    color === "orange" ? "bg-orange-500" : 
    "bg-purple-500";
  
  return (
    <div className={cn(
      "loader", 
      colorClass,
      sizeClasses[size],
      "relative inline-block",
      className
    )} />
  );
};

export default LoadingAnimation;
