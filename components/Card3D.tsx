"use client";

import React, { useState, useRef } from "react";

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
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [useTransition, setUseTransition] = useState(true);

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

    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setUseTransition(true);
    // Temporarily apply transition on enter for initial snap ease
    setTimeout(() => {
      setUseTransition(false);
    }, 150);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setUseTransition(true);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transformStyle: "preserve-3d",
        transition: useTransition ? "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease" : "box-shadow 0.4s ease",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
