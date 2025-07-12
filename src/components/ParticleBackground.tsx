
import { useEffect, useRef, useCallback } from 'react';

interface ParticleBackgroundProps {
  color?: string; 
}

const ParticleBackground = ({ color = '#00C2A8' }: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resizeCanvas();
    
    // Reduced particle count for better performance
    const particleCount = 25; // Reduced from 50
    const particleColor = color;
    
    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speedX = (Math.random() - 0.5) * 0.5; // Reduced speed
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1; // Reduced size
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
      }
    }

    // Create initial particles
    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(new Particle());
    }

    let lastTime = 0;
    const targetFPS = 30; // Limit to 30 FPS for better performance
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        // Clear with solid background for better performance
        ctx.fillStyle = 'rgba(13, 13, 13, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particlesRef.current.forEach(particle => {
          particle.update();
          particle.draw();
        });

        lastTime = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    // Add resize listener with throttling
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [color, resizeCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-prism-bg"
      style={{ willChange: 'auto' }} // Optimize for performance
    />
  );
};

export default ParticleBackground;
