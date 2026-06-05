"use client";

import { useEffect, useState } from "react";
import PageHero from "@/components/universal/PageHero";
import SectionTitle from "@/components/universal/SectionTitle";
import SemesterTabs from "@/components/kurikulum/SemesterTabs";
import CPLSection from "@/components/kurikulum/CPLSection";
import KurikulumInfo from "@/components/kurikulum/KurikulumInfo";
import { cachedFetch } from "@/lib/fetchCache";
import LazySection from "@/components/universal/LazySection";

export default function KurikulumPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    cachedFetch<any>("/api/kurikulum")
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error("Failed to fetch kurikulum data", err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <>
        <PageHero
          title="Kurikulum"
          subtitle="Struktur mata kuliah dan capaian pembelajaran lulusan program studi."
        />
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium animate-pulse">Loading Kurikulum...</p>
          </div>
        </div>
      </>
    );
  }

  const kurikulum = data?.kurikulum || null;
  const mataKuliah = [...(data?.mata_kuliah || [])].sort((a, b) => a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: "base" }));
  const cpl = [...(data?.cpl || [])].sort((a, b) => a.kode.localeCompare(b.kode, undefined, { numeric: true, sensitivity: "base" }));

  return (
    <>
      <PageHero
        title="Kurikulum"
        subtitle="Struktur mata kuliah dan capaian pembelajaran lulusan program studi."
      />

      {/* Info Kurikulum Aktif (White) */}
      <section className="py-24 bg-white relative overflow-hidden text-primary-950">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-50/50 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-accent-400/5 blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <KurikulumInfo kurikulum={kurikulum} mataKuliah={mataKuliah} />
        </div>
      </section>

      {/* Mata Kuliah per Semester (Dark Navy Blue) */}
      <LazySection placeholderHeight="550px">
        <section className="py-24 bg-gradient-to-br from-primary-950 via-primary-950/95 to-primary-900/90 relative overflow-hidden text-white border-y border-primary-900">
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

          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Section heading */}
            <div className="mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-900/80 text-primary-300 border border-primary-800/30 text-xs font-semibold uppercase tracking-wider mb-4">
                Struktur Kurikulum
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Mata Kuliah per Semester</h2>
              <p className="mt-2 text-primary-200/80 max-w-xl text-sm sm:text-base leading-relaxed">
                Pilih semester untuk melihat daftar mata kuliah yang ditawarkan.
              </p>
              <div className="mt-3 h-1 w-12 bg-gradient-to-r from-accent-400 to-accent-500 rounded-full" />
            </div>
            <SemesterTabs mataKuliah={mataKuliah} />
          </div>
        </section>
      </LazySection>

      {/* CPL (White) */}
      <LazySection placeholderHeight="450px">
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Decorative side pattern */}
          <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full bg-primary-100/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -left-16 w-48 h-48 rounded-full bg-accent-400/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <CPLSection cplList={cpl} />
          </div>
        </section>
      </LazySection>
    </>
  );
}
