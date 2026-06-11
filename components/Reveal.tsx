"use client";

import { motion, HTMLMotionProps } from "framer-motion";

export const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
};

export const stagger = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-50px" },
  variants: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  },
};

export const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};


interface RevealProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export default function Reveal({ children, className, ...props }: RevealProps) {
  return (
    <motion.div {...fadeUp} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="label-overline">{children}</div>;
}

