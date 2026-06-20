"use client";

import React, { useRef } from "react";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  maxRotate?: number;
  scale?: number;
}

export default function Card3D({
  children,
  className = "",
  maxRotate = 10,
  scale = 1.03
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateYVal = ((x - centerX) / centerX) * maxRotate;
    const rotateXVal = -((y - centerY) / centerY) * maxRotate;

    card.style.transform = `perspective(1000px) rotateX(${rotateXVal}deg) rotateY(${rotateYVal}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    card.style.transition = "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease";
    transitionTimeoutRef.current = setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = "box-shadow 0.4s ease";
      }
    }, 150);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    card.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease";
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transformStyle: "preserve-3d",
        transition: "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
