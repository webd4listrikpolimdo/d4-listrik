"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  /**
   * Estimated height of the placeholder to reserve layout space and prevent collapsing.
   * e.g., "300px", "400px"
   */
  placeholderHeight?: string;
  className?: string;
  /**
   * Margin around the root. A smaller margin (e.g. "50px" or "0px") ensures
   * the transition is visible precisely when the user scrolls to it.
   */
  rootMargin?: string;
}

export default function LazySection({
  children,
  placeholderHeight = "200px",
  className = "",
  rootMargin = "50px",
}: LazySectionProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      {
        rootMargin,
      }
    );

    const currentElement = containerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [isInView, rootMargin]);

  return (
    <div
      ref={containerRef}
      className={`${className} transition-all duration-700 ease-out ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
      style={!isInView ? { minHeight: placeholderHeight } : undefined}
    >
      {isInView ? children : null}
    </div>
  );
}
