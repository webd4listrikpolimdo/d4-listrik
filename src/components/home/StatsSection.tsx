"use client";

import { useEffect, useState, useRef } from "react";
import { HiAcademicCap, HiUserGroup, HiBookOpen, HiTrophy } from "react-icons/hi2";
import { cachedFetch } from "@/lib/fetchCache";

interface StatItem {
  label: string;
  value: number;
  suffix: string;
  icon: React.ReactNode;
}

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, inView]);

  return (
    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent">
      {count.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statData = await cachedFetch<any>("/api/statistik");

        const mahasiswaAktif = statData.total_mahasiswa_aktif || 0;
        const lulusan = statData.total_lulusan || 0;
        const dosenCount = statData.total_dosen_homebase !== undefined ? statData.total_dosen_homebase : (statData.total_dosen || 0);
        const mataKuliahCount = statData.total_mata_kuliah || 0;

        setStats([
          { label: "Mahasiswa Aktif", value: mahasiswaAktif, suffix: "+", icon: <HiAcademicCap className="text-accent-400" /> },
          { label: "Dosen Pengajar", value: dosenCount, suffix: "", icon: <HiUserGroup className="text-accent-400" /> },
          { label: "Mata Kuliah", value: mataKuliahCount, suffix: "+", icon: <HiBookOpen className="text-accent-400" /> },
          { label: "Lulusan", value: lulusan, suffix: "+", icon: <HiTrophy className="text-accent-400" /> },
        ]);
      } catch (e) {
        console.error("Failed to fetch stats", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-primary-950 via-primary-950/95 to-primary-900/90 relative overflow-hidden border-y border-primary-900 text-white">
      {/* Decorative blurs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-accent-400/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full bg-primary-400/5 blur-3xl pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] z-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        {/* Section heading */}
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/80 text-primary-300 border border-primary-800/30 text-xs font-semibold uppercase tracking-wider mb-4">
            Data & Statistik
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Program Studi Dalam Angka</h2>
          <p className="mt-2 text-primary-200/80 text-sm sm:text-base max-w-lg mx-auto">Ringkasan data terkini mengenai civitas akademika program studi.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="relative bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse"
                >
                  <div className="w-8 h-8 bg-white/10 rounded-lg mb-3" />
                  <div className="w-20 h-9 bg-white/10 rounded-lg mb-2" />
                  <div className="w-24 h-4 bg-white/5 rounded" />
                </div>
              ))
            : stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-accent-400/30 hover:bg-white/10 shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-2xl mb-3">{stat.icon}</div>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
                  <p className="mt-1 text-sm text-primary-200/80 font-medium">{stat.label}</p>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl rounded-tr-2xl" />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
