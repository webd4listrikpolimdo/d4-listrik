import { Metadata } from "next";
import PageHero from "@/components/universal/PageHero";
import DosenListClient from "./DosenListClient";
import LazySection from "@/components/universal/LazySection";

export const metadata: Metadata = {
  title: "Staf",
  description: "Daftar dosen pengajar dan pegawai Program Studi D4 Teknik Listrik Politeknik Negeri Manado.",
};

const StaffSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-72 bg-gray-100/70 rounded-2xl border border-gray-100 flex flex-col justify-between p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gray-200/80" />
          <div className="h-4 bg-gray-200/80 rounded w-3/4" />
          <div className="h-3 bg-gray-200/50 rounded w-1/2" />
        </div>
        <div className="h-8 bg-gray-200/30 rounded w-full mt-4" />
      </div>
    ))}
  </div>
);

export default function DosenPage() {
  return (
    <>
      <PageHero
        title="Staf Program Studi"
        subtitle="Tenaga pengajar profesional dan pegawai administrasi yang berpengalaman."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LazySection placeholderHeight="600px" skeleton={<StaffSkeleton />}>
            <DosenListClient />
          </LazySection>
        </div>
      </section>
    </>
  );
}

