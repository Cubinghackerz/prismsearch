
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2, // Reduced from 4 to 2 (50% faster)
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  
  // Ensure we have valid numbers with proper defaults
  const fromValue = typeof from === 'number' && isFinite(from) ? from : 0;
  const toValue = typeof to === 'number' && isFinite(to) ? to : 0;
  
  const motionValue = useMotionValue(direction === "down" ? toValue : fromValue);

  // Adjusted spring settings for smoother animation with faster duration
  const damping = 30 + 40 * (1 / duration);
  const stiffness = 60 * (1 / duration);

  const springValue = useSpring(motionValue, {
    damping,
    stiffness,
  });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  // Get number of decimal places in a number
  const getDecimalPlaces = (num: number): number => {
    // Comprehensive null/undefined/invalid check
    if (num == null || typeof num !== 'number' || !isFinite(num) || isNaN(num)) {
      return 0;
    }
    
    try {
      const str = num.toString();
      if (str.includes(".")) {
        const decimals = str.split(".")[1];
        if (decimals && parseInt(decimals) !== 0) {
          return decimals.length;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error in getDecimalPlaces:', error);
      return 0;
    }
  };

  const maxDecimals = Math.max(getDecimalPlaces(fromValue), getDecimalPlaces(toValue));

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = String(direction === "down" ? toValue : fromValue);
    }
  }, [fromValue, toValue, direction]);

  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === "function") {
        onStart();
      }

      const timeoutId = setTimeout(() => {
        motionValue.set(direction === "down" ? fromValue : toValue);
      }, delay * 1000);

      const durationTimeoutId = setTimeout(
        () => {
          if (typeof onEnd === "function") {
            onEnd();
          }
        },
        delay * 1000 + duration * 1000
      );

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(durationTimeoutId);
      };
    }
  }, [
    isInView,
    startWhen,
    motionValue,
    direction,
    fromValue,
    toValue,
    delay,
    onStart,
    onEnd,
    duration,
  ]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current && typeof latest === 'number' && isFinite(latest)) {
        const hasDecimals = maxDecimals > 0;

        const options: Intl.NumberFormatOptions = {
          useGrouping: !!separator,
          minimumFractionDigits: hasDecimals ? maxDecimals : 0,
          maximumFractionDigits: hasDecimals ? maxDecimals : 0,
        };

        try {
          const formattedNumber = Intl.NumberFormat("en-US", options).format(latest);
          ref.current.textContent = separator
            ? formattedNumber.replace(/,/g, separator)
            : formattedNumber;
        } catch (error) {
          console.error('Error formatting number:', error);
          ref.current.textContent = String(latest);
        }
      }
    });

    return () => unsubscribe();
  }, [springValue, separator, maxDecimals]);

  return <span className={className} ref={ref} />;
}
