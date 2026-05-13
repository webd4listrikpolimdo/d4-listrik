import { Metadata } from "next";
import PageHero from "@/components/universal/PageHero";
import SectionTitle from "@/components/universal/SectionTitle";
import SemesterTabs from "@/components/kurikulum/SemesterTabs";
import CPLSection from "@/components/kurikulum/CPLSection";
import KurikulumInfo from "@/components/kurikulum/KurikulumInfo";

export const metadata: Metadata = {
  title: "Kurikulum",
  description:
    "Struktur kurikulum dan capaian pembelajaran lulusan D4 Teknik Listrik Politeknik Negeri Manado.",
};

export default function KurikulumPage() {
  return (
    <>
      <PageHero
        title="Kurikulum"
        subtitle="Struktur mata kuliah dan capaian pembelajaran lulusan program studi."
      />

      {/* Info Kurikulum Aktif */}
      <section className="py-12 pb-0">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <KurikulumInfo />
        </div>
      </section>

      {/* Mata Kuliah per Semester */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            title="Mata Kuliah per Semester"
            subtitle="Pilih semester untuk melihat daftar mata kuliah yang ditawarkan."
          />
          <SemesterTabs />
        </div>
      </section>

      {/* CPL */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <CPLSection />
        </div>
      </section>
    </>
  );
}
