
import { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  color?: string; 
}

const ParticleBackground = ({ color = '#00C2A8' }: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle settings
    const particles: Particle[] = [];
    const particleCount = 50;
    const particleColor = color;
    // Determine glow color based on primary color
    const particleGlowColor = color === '#00C2A8' ? '#1DD1B8' : 
                             color === '#9B5DE5' ? '#B47EE8' : 
                             '#1DD1B8'; // Default to teal glow
    
    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.size = Math.random() * 4 + 2; // Increased particle size
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
        ctx.fillStyle = particleColor;
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = particleGlowColor;
        ctx.strokeStyle = particleGlowColor;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow for next particle
      }
    }

    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      // Clear background with higher opacity to remove trails
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; // Dark blue background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-slate-900" // Dark blue background
    />
  );
};

export default ParticleBackground;
