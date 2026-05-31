"use client";

import React, { useState, useEffect, useRef } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  /**
   * Estimated height of the section to prevent layout shift before loading.
   * e.g. "min-h-[400px]" or a height in pixels.
   */
  placeholderHeight?: string;
  className?: string;
  /**
   * Margin around the root. e.g. "200px" means load 200px before the element enters the viewport.
   */
  rootMargin?: string;
  /**
   * Custom skeleton element to display while loading.
   * If not provided, a default modern shimmer skeleton will be shown.
   */
  skeleton?: React.ReactNode;
}

const DefaultSkeleton = () => (
  <div className="w-full h-full p-8 bg-gray-50/60 rounded-3xl border border-gray-100 flex flex-col justify-between animate-pulse">
    <div className="space-y-4">
      {/* Skeleton title */}
      <div className="h-6 bg-gray-200/80 rounded-lg w-1/4" />
      {/* Skeleton subtitle */}
      <div className="h-4 bg-gray-200/50 rounded-md w-1/2" />
    </div>
    {/* Skeleton content area */}
    <div className="h-48 bg-gray-200/40 rounded-2xl w-full mt-8" />
  </div>
);

export default function LazySection({
  children,
  placeholderHeight = "300px",
  className = "",
  rootMargin = "200px",
  skeleton,
}: LazySectionProps) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInView) return;

    // Check if IntersectionObserver is supported
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
      className={className}
      style={!isInView ? { minHeight: placeholderHeight } : undefined}
    >
      {isInView ? (
        children
      ) : (
        <div style={{ height: placeholderHeight }} className="w-full">
          {skeleton || <DefaultSkeleton />}
        </div>
      )}
    </div>
  );
}
