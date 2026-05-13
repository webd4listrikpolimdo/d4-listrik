import { beritaData } from "@/data/berita";
import SectionTitle from "@/components/universal/SectionTitle";
import { HiNewspaper } from "react-icons/hi2";

export default function NewsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          title="Berita & Artikel Terkini"
          subtitle="Informasi terbaru seputar kegiatan dan pencapaian program studi."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {beritaData.map((berita, index) => (
            <article
              key={berita.id}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Colored placeholder image */}
              <div
                className={`h-48 bg-gradient-to-br ${berita.warna} flex items-center justify-center relative overflow-hidden`}
              >
                <HiNewspaper className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <div className="p-5">
                <time className="text-xs text-primary-600 font-semibold uppercase tracking-wider">
                  {berita.tanggal}
                </time>
                <h3 className="mt-2 text-base font-bold text-primary-950 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">
                  {berita.judul}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {berita.ringkasan}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                  Baca selengkapnya
                  <svg
                    className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
