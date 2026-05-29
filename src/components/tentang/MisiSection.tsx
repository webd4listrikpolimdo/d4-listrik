"use client";

import { useState, useEffect } from "react";
import { HiRocketLaunch, HiChevronLeft, HiChevronRight } from "react-icons/hi2";

interface VisiMisiItem {
  id: string;
  kategori: "visi" | "misi" | "tujuan";
  konten: string;
  urutan: number;
}

interface MisiSectionProps {
  items: VisiMisiItem[];
}

const parseContent = (konten: string, index: number, defaultTitlePrefix: string) => {
  const parts = konten.split(":");
  if (parts.length > 1 && parts[0].trim().length < 45) {
    return {
      title: parts[0].trim(),
      desc: parts.slice(1).join(":").trim(),
    };
  }
  return {
    title: `${defaultTitlePrefix} ${index + 1}`,
    desc: konten.trim(),
  };
};

export default function MisiSection({ items }: MisiSectionProps) {
  const [currentMisi, setCurrentMisi] = useState(0);

  // Auto-play Misi
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentMisi((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-white relative overflow-hidden text-primary-950">
      {/* Decorative side pattern */}
      <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-primary-100/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-16 w-48 h-48 rounded-full bg-accent-400/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-14 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-4">
            <HiRocketLaunch className="w-4 h-4" />
            Langkah Strategis
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-950">Misi Program Studi</h2>
          <p className="mt-2 text-gray-500 text-sm sm:text-base max-w-lg mx-auto">
            Upaya nyata yang dilakukan untuk mewujudkan visi program studi.
          </p>
          <div className="mt-4 h-1 w-12 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full mx-auto" />
        </div>

        <div className="relative bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-md overflow-hidden min-h-[180px] flex items-center max-w-3xl mx-auto">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500" />

          {/* Navigation chevrons */}
          {items.length > 1 && (
            <>
              <button
                onClick={() => setCurrentMisi((prev) => (prev === 0 ? items.length - 1 : prev - 1))}
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-primary-700 hover:bg-primary-50 hover:scale-110 active:scale-95 transition-all"
                aria-label="Misi sebelumnya"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMisi((prev) => (prev === items.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center text-primary-700 hover:bg-primary-50 hover:scale-110 active:scale-95 transition-all"
                aria-label="Misi berikutnya"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Misi slide content */}
          <div className="w-full overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentMisi * 100}%)`,
              }}
            >
              {items.map((m, index) => {
                const { title, desc } = parseContent(m.konten, index, "Misi");
                const hasTitle = m.konten.includes(":") && m.konten.split(":")[0].trim().length < 45;
                return (
                  <div key={m.id} className="w-full shrink-0 flex items-start gap-4 px-12 sm:px-16">
                    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white text-sm font-bold shadow-md">
                      {index + 1}
                    </div>
                    <div className="pt-1">
                      {hasTitle && <h3 className="font-bold text-primary-950 text-base mb-1">{title}</h3>}
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dot Indicators for Misi */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-1.5">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentMisi(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === currentMisi ? "w-6 h-2 bg-primary-600" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Misi slide ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-medium tabular-nums ml-2">
              {currentMisi + 1} / {items.length}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
