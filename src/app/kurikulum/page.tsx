"use client";

import { useEffect, useState } from "react";
import PageHero from "@/components/universal/PageHero";
import SectionTitle from "@/components/universal/SectionTitle";
import SemesterTabs from "@/components/kurikulum/SemesterTabs";
import CPLSection from "@/components/kurikulum/CPLSection";
import KurikulumInfo from "@/components/kurikulum/KurikulumInfo";
import { cachedFetch } from "@/lib/fetchCache";

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
            <p className="text-sm text-gray-500 font-medium">Memuat data kurikulum...</p>
          </div>
        </div>
      </>
    );
  }

  const kurikulum = data?.kurikulum || null;
  const mataKuliah = data?.mata_kuliah || [];
  const cpl = data?.cpl || [];

  return (
    <>
      <PageHero
        title="Kurikulum"
        subtitle="Struktur mata kuliah dan capaian pembelajaran lulusan program studi."
      />

      {/* Info Kurikulum Aktif */}
      <section className="py-12 pb-0">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <KurikulumInfo kurikulum={kurikulum} mataKuliah={mataKuliah} />
        </div>
      </section>

      {/* Mata Kuliah per Semester */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Mata Kuliah per Semester"
            subtitle="Pilih semester untuk melihat daftar mata kuliah yang ditawarkan."
          />
          <SemesterTabs mataKuliah={mataKuliah} />
        </div>
      </section>

      {/* CPL */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <CPLSection cplList={cpl} />
        </div>
      </section>
    </>
  );
}
