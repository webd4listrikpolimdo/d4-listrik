import { Dosen, getTotalKarya } from "@/types/dosen";
import KaryaTabs from "./KaryaTabs";
import Link from "next/link";
import { HiBriefcase, HiTag, HiEnvelope, HiPhone, HiDocumentText, HiBookOpen } from "react-icons/hi2";

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

function getInitials(nama: string): string {
  return nama
    .split(" ")
    .filter((w) => !w.includes(".") && !w.includes(","))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function DosenProfile({ dosen, index }: { dosen: Dosen; index: number }) {
  const initials = getInitials(dosen.nama);
  const color = avatarColors[index % avatarColors.length];
  const totalKarya = getTotalKarya(dosen);

  return (
    <div className="animate-fade-in-up">
      {/* Back button */}
      <Link
        href="/staf"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 font-medium mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Kembali ke Daftar Staf
      </Link>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
        {/* Top gradient bar */}
        <div className={`h-3 bg-gradient-to-r ${color}`} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Large Avatar */}
            <img
              src={dosen.foto || "/images/default-profile.svg"}
              alt={dosen.nama}
              className="flex-shrink-0 w-24 h-24 rounded-2xl object-cover shadow-xl"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-primary-950">{dosen.nama}</h1>
              <p className="text-sm text-gray-400 font-mono mt-1">NIDN: {dosen.nidn}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {dosen.jabatan && (
                  <div className="flex items-center gap-2 text-sm">
                    <HiBriefcase className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Jabatan</p>
                      <p className="font-medium text-gray-700">{dosen.jabatan}</p>
                    </div>
                  </div>
                )}
                {dosen.pangkat && (
                  <div className="flex items-center gap-2 text-sm">
                    <HiTag className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400">Pangkat</p>
                      <p className="font-medium text-gray-700">{dosen.pangkat}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <HiEnvelope className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-medium text-gray-700">
                      {dosen.email || (
                        <span className="text-gray-400 italic">Belum ditambahkan</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HiPhone className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Telepon</p>
                    <p className="font-medium text-gray-700">
                      {dosen.telepon || (
                        <span className="text-gray-400 italic">Belum ditambahkan</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HiDocumentText className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Total Karya</p>
                    <p className="font-semibold text-primary-700">{totalKarya}</p>
                  </div>
                </div>
              </div>

              {/* Bidang Keahlian */}
              <div className="mt-5">
                <p className="text-xs text-gray-400 mb-2">Bidang Keahlian</p>
                <div className="flex flex-wrap gap-2">
                  {dosen.bidangKeahlian.map((bk) => (
                    <span
                      key={bk}
                      className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium"
                    >
                      {bk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Karya Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h2 className="text-xl font-bold text-primary-950 mb-6 flex items-center gap-2">
          <HiBookOpen className="text-xl" /> Karya & Kontribusi
        </h2>
        <KaryaTabs dosen={dosen} />
      </div>
    </div>
  );
}
