import Link from "next/link";
import { Dosen, getTotalKarya } from "@/data/dosen";
import { HiBriefcase, HiTag, HiDocumentText } from "react-icons/hi2";

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .filter((w) => !w.includes(".") && !w.includes(","))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-purple-600",
];

export default function DosenCard({ dosen, index }: { dosen: Dosen; index: number }) {
  const initials = getInitials(dosen.nama);
  const color = avatarColors[index % avatarColors.length];
  const totalKarya = getTotalKarya(dosen);

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top gradient bar */}
      <div className={`h-2 bg-gradient-to-r ${color}`} />

      <div className="p-6">
        {/* Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={dosen.foto || "/images/default-profile.svg"}
            alt={dosen.nama}
            className="flex-shrink-0 w-16 h-16 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
          <div className="min-w-0">
            <h3 className="font-bold text-primary-950 text-base leading-snug truncate">
              {dosen.nama}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">NIDN: {dosen.nidn}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {dosen.jabatan && (
            <div className="flex items-center gap-2 text-sm">
              <HiBriefcase className="text-gray-400 text-xs" />
              <span className="text-gray-600">{dosen.jabatan}</span>
            </div>
          )}
          {dosen.pangkat && (
            <div className="flex items-center gap-2 text-sm">
              <HiTag className="text-gray-400 text-xs" />
              <span className="text-gray-600">{dosen.pangkat}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <HiDocumentText className="text-gray-400 text-xs" />
            <span className="text-gray-600">
              <span className="font-semibold text-primary-700">{totalKarya}</span> Karya
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/dosen/${dosen.id}`}
          className="inline-flex items-center w-full justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-semibold text-sm hover:bg-primary-600 hover:text-white transition-all duration-200 group/btn"
        >
          Lihat Profil
          <svg
            className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
