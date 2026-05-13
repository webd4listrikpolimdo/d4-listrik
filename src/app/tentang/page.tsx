import { Metadata } from "next";
import PageHero from "@/components/universal/PageHero";
import VisiMisiSection from "@/components/tentang/VisiMisiSection";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Visi, misi, dan tujuan Program Studi D4 Teknik Listrik Politeknik Negeri Manado.",
};

export default function TentangPage() {
  return (
    <>
      <PageHero
        title="Tentang Program Studi"
        subtitle="Mengenal lebih dekat visi, misi, dan tujuan D4 Teknik Listrik."
      />
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <VisiMisiSection />
        </div>
      </section>
    </>
  );
}
