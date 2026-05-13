import { Metadata } from "next";
import PageHero from "@/components/universal/PageHero";
import DosenListClient from "./DosenListClient";

export const metadata: Metadata = {
  title: "Dosen",
  description: "Daftar dosen pengajar Program Studi D4 Teknik Listrik Politeknik Negeri Manado.",
};

export default function DosenPage() {
  return (
    <>
      <PageHero
        title="Dosen Pengajar"
        subtitle="Tenaga pengajar profesional dan berpengalaman di bidang teknik ketenagalistrikan."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DosenListClient />
        </div>
      </section>
    </>
  );
}
