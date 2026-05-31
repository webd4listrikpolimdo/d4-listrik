import { Metadata } from "next";
import PageHero from "@/components/universal/PageHero";
import DosenListClient from "./DosenListClient";
import LazySection from "@/components/universal/LazySection";

export const metadata: Metadata = {
  title: "Staf",
  description: "Daftar dosen pengajar dan pegawai Program Studi D4 Teknik Listrik Politeknik Negeri Manado.",
};

export default function DosenPage() {
  return (
    <>
      <PageHero
        title="Staf Program Studi"
        subtitle="Tenaga pengajar profesional dan pegawai administrasi yang berpengalaman."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <LazySection placeholderHeight="600px">
            <DosenListClient />
          </LazySection>
        </div>
      </section>
    </>
  );
}

