import SectionTitle from "@/components/universal/SectionTitle";

interface CPLSectionProps {
  cplList?: {
    kode: string;
    deskripsi: string;
  }[];
}

export default function CPLSection({ cplList }: CPLSectionProps) {
  const activeCplList = cplList || [];

  return (
    <div>
      <SectionTitle
        title="Capaian Pembelajaran Lulusan"
        subtitle="Kompetensi yang harus dicapai oleh lulusan program studi."
      />

      <div className="grid gap-4">
        {activeCplList.map((cpl, index) => (
          <div
            key={cpl.kode}
            className="flex items-start gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 text-white text-xs font-bold shadow-md">
              {cpl.kode.replace("CPL-", "")}
            </div>
            <div>
              <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
                {cpl.kode}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed mt-1">{cpl.deskripsi}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
