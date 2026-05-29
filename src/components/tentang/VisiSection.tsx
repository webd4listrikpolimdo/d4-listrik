"use client";

import { HiEye } from "react-icons/hi2";

interface VisiMisiItem {
  id: string;
  kategori: "visi" | "misi" | "tujuan";
  konten: string;
  urutan: number;
}

interface VisiSectionProps {
  items: VisiMisiItem[];
}

export default function VisiSection({ items }: VisiSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-br from-primary-950 via-primary-950/95 to-primary-900/90 relative overflow-hidden border-y border-primary-900 text-white">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent-400/5 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-400/5 blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-14 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/80 text-primary-300 border border-primary-800/30 text-xs font-semibold uppercase tracking-wider mb-4">
            <HiEye className="w-4 h-4 text-accent-400" />
            Landasan Utama
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Visi Program Studi</h2>
          <p className="mt-2 text-primary-200/80 text-sm sm:text-base max-w-lg mx-auto">
            Arah dan cita-cita jangka panjang program studi dalam mendidik mahasiswa.
          </p>
          <div className="mt-4 h-1 w-12 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full mx-auto" />
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {items.map((v) => (
            <div
              key={v.id}
              className="relative bg-white/5 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-white/10 shadow-xl overflow-hidden animate-fade-in-up"
            >
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-accent-400/10 blur-xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-primary-400/10 blur-2xl pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-400 via-primary-400 to-accent-500" />

              {/* Quote marks */}
              <div className="absolute top-3 left-6 text-6xl text-white/5 font-serif leading-none select-none">&ldquo;</div>

              <p className="relative z-10 text-lg sm:text-xl text-white font-medium leading-relaxed italic text-center">
                &ldquo;{v.konten}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
