'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    let starId = 0;
    
    const createStar = () => {
      const newStar: Star = {
        id: starId++,
        x: Math.random() * 100, // 0-100%
        y: Math.random() * 100, // 0-100%
        size: Math.random() * 3 + 1, // 1-4px
        delay: Math.random() * 1.5, // 0-1.5s delay
      };
      
      setStars(prev => [...prev, newStar]);
      
      // Remove a estrela após a animação
      setTimeout(() => {
        setStars(prev => prev.filter(star => star.id !== newStar.id));
      }, 5000); // 5s total (0.5s animação + 4.5s visível)
    };

    // Cria estrelas em intervalos aleatórios
    const interval = setInterval(() => {
      if (Math.random() < 0.7) { // 70% de chance a cada intervalo
        createStar();
      }
    }, 300); // A cada 300ms

    // Cria muitas estrelas iniciais
    for (let i = 0; i < 15; i++) {
      setTimeout(() => createStar(), i * 100);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
} 