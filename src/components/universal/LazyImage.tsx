"use client";

import { useState, useEffect, memo } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  wrapperClassName?: string;
}

const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = "",
  fallbackSrc = "/images/default.svg",
  wrapperClassName = "",
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  // Synchronize src updates
  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setIsLoaded(false);
  }, [src, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* Skeleton / Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100/80 animate-pulse flex items-center justify-center z-10">
          <div className="w-5 h-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt || "Image"}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setCurrentSrc(fallbackSrc)}
        className={`transition-all duration-500 ${
          isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-98 blur-sm"
        } ${className}`}
        {...props}
      />
    </div>
  );
});

export default LazyImage;
