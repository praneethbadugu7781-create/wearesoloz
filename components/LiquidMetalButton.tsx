"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  href?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function LiquidMetalButton({
  label = "Join Community",
  onClick,
  href,
  width = 160,
  height = 44,
  className = ""
}: LiquidMetalButtonProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const innerWidth = width - 4;
  const innerHeight = height - 4;

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-animation {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    let isMounted = true;

    const loadShader = async () => {
      try {
        const { liquidMetalFragmentShader, ShaderMount } = await import("@paper-design/shaders");

        if (shaderRef.current && isMounted) {
          if (shaderMount.current?.destroy) {
            shaderMount.current.destroy();
          }

          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            {
              u_repetition: 4,
              u_softness: 0.5,
              u_shiftRed: 0.3,
              u_shiftBlue: 0.3,
              u_distortion: 0,
              u_contour: 0,
              u_angle: 45,
              u_scale: 8,
              u_shape: 1,
              u_offsetX: 0.1,
              u_offsetY: -0.1,
            },
            undefined,
            0.6,
          );
        }
      } catch (error) {
        console.warn("Shader loading skipped, using fallback metal border:", error);
      }
    };

    loadShader();

    return () => {
      isMounted = false;
      if (shaderMount.current?.destroy) {
        shaderMount.current.destroy();
        shaderMount.current = null;
      }
    };
  }, [width, height]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    shaderMount.current?.setSpeed?.(1);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    shaderMount.current?.setSpeed?.(0.6);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4);
      setTimeout(() => {
        if (isHovered) {
          shaderMount.current?.setSpeed?.(1);
        } else {
          shaderMount.current?.setSpeed?.(0.6);
        }
      }, 300);
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ripple = { x, y, id: rippleId.current++ };

      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
      }, 600);
    }

    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: `${width}px`,
            height: `${height}px`,
            transformStyle: "preserve-3d",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: "none",
          }}
        >
          {/* Label Layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transformStyle: "preserve-3d",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: "translateZ(20px)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            <span
              className="font-sans"
              style={{
                fontSize: "13.5px",
                color: "#ffffff",
                fontWeight: 600,
                letterSpacing: "0.02em",
                textShadow: "0px 1px 3px rgba(0, 0, 0, 0.8)",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>

          {/* Inner Dark Surface */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              transformStyle: "preserve-3d",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: `${innerWidth}px`,
                height: `${innerHeight}px`,
                margin: "2px",
                borderRadius: "100px",
                background: "linear-gradient(180deg, #1c1c1e 0%, #0a0a0c 100%)",
                boxShadow: isPressed
                  ? "inset 0px 2px 4px rgba(0, 0, 0, 0.6)"
                  : "inset 0px 1px 1px rgba(255, 255, 255, 0.1)",
                transition: "all 0.4s ease",
              }}
            />
          </div>

          {/* Shader & Metallic Rim Layer */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              transformStyle: "preserve-3d",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                height: `${height}px`,
                width: `${width}px`,
                borderRadius: "100px",
                background: "conic-gradient(from 180deg at 50% 50%, #cbd5e1 0deg, #64748b 90deg, #ffffff 180deg, #475569 270deg, #cbd5e1 360deg)",
                boxShadow: isPressed
                  ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
                  : isHovered
                    ? "0 0 16px rgba(255, 255, 255, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)"
                    : "0 2px 8px rgba(0, 0, 0, 0.25)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                ref={shaderRef}
                className="shader-container-exploded"
                style={{
                  borderRadius: "100px",
                  overflow: "hidden",
                  position: "relative",
                  width: `${width}px`,
                  maxWidth: `${width}px`,
                  height: `${height}px`,
                }}
              />
            </div>
          </div>

          {/* Interactive Trigger & Ripple Button */}
          <button
            ref={buttonRef}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              outline: "none",
              zIndex: 40,
              transformStyle: "preserve-3d",
              transform: "translateZ(25px)",
              overflow: "hidden",
              borderRadius: "100px",
            }}
            aria-label={label}
          >
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                style={{
                  position: "absolute",
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 70%)",
                  pointerEvents: "none",
                  animation: "ripple-animation 0.6s ease-out",
                }}
              />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}
