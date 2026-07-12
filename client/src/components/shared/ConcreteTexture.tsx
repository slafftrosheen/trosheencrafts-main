import { useEffect, useRef } from 'react';

interface ConcreteTextureProps {
  className?: string;
}

export function ConcreteTexture({ className = '' }: ConcreteTextureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    // Create concrete-like texture
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 30 - 15;
      const gray = 180 + noise;

      data[i] = gray;     // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      data[i + 3] = Math.random() * 20; // A (very subtle)
    }

    ctx.putImageData(imageData, 0, 0);

    // Add subtle grain overlay
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2;

      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
      ctx.fillRect(x, y, size, size);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none mix-blend-overlay ${className}`}
      style={{ zIndex: 1 }}
    />
  );
}
