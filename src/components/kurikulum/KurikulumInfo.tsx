import { kurikulumAktif, kurikulumData } from "@/data/kurikulum";
import {
  HiCheckBadge,
  HiBookOpen,
  HiCalendarDays,
  HiCalculator,
  HiArrowTopRightOnSquare,
} from "react-icons/hi2";

interface KurikulumInfoProps {
  kurikulum?: {
    nama: string;
    deskripsi: string;
    berlaku_sejak: string;
    file_url: string | null;
  } | null;
  mataKuliah?: {
    kode: string;
    nama: string;
    sks: number;
    semester: number;
  }[];
}

export default function KurikulumInfo({ kurikulum, mataKuliah }: KurikulumInfoProps) {
  // Fallback values using static data
  const name = kurikulum?.nama ?? kurikulumAktif.nama;
  const description = kurikulum?.deskripsi ?? kurikulumAktif.deskripsi;
  const berlakuSejak = kurikulum?.berlaku_sejak ?? kurikulumAktif.berlakuSejak;
  const fileUrl = kurikulum ? kurikulum.file_url : kurikulumAktif.fileUrl;

  // Hitung total SKS dari semua semester
  const totalSKS = mataKuliah
    ? mataKuliah.reduce((sum, mk) => sum + mk.sks, 0)
    : kurikulumData.reduce(
        (total, sem) => total + sem.mataKuliah.reduce((sum, mk) => sum + mk.sks, 0),
        0
      );

  // Hitung total mata kuliah
  const totalMK = mataKuliah
    ? mataKuliah.length
    : kurikulumData.reduce(
        (total, sem) => total + sem.mataKuliah.length,
        0
      );

  // Hitung jumlah semester
  const totalSemester = mataKuliah
    ? Array.from(new Set(mataKuliah.map((m) => m.semester))).length || 8
    : kurikulumData.length;

  return (
    <div className="animate-fade-in-up">
      <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Top accent gradient */}
        <div className="h-1.5 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500" />

        <div className="p-6 sm:p-8">
          {/* Badge kurikulum aktif */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <HiCheckBadge className="text-sm" />
              Kurikulum Aktif
            </span>
          </div>

          {/* Nama kurikulum */}
          <h2 className="text-xl sm:text-2xl font-bold text-primary-950 mb-3">
            {name}
          </h2>

          {/* Deskripsi */}
          <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-3xl">
            {description}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-primary-50/60 rounded-xl p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <HiCalendarDays className="text-lg" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Berlaku Sejak</p>
                <p className="text-sm font-semibold text-primary-900">{berlakuSejak}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-primary-50/60 rounded-xl p-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <HiCalculator className="text-lg" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Total SKS</p>
                <p className="text-sm font-semibold text-primary-900">{totalSKS} SKS</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-primary-50/60 rounded-xl p-3.5 col-span-2 sm:col-span-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                <HiBookOpen className="text-lg" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Mata Kuliah</p>
                <p className="text-sm font-semibold text-primary-900">{totalMK} MK · {totalSemester} Semester</p>
              </div>
            </div>
          </div>

          {/* Tombol lihat file */}
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <HiArrowTopRightOnSquare className="text-base" />
              Lihat Dokumen Kurikulum
            </a>
          ) : (
            <button
              disabled
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
            >
              <HiArrowTopRightOnSquare className="text-base" />
              Dokumen Belum Tersedia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
