"use client";

import { useState } from "react";
import Modal from "@/components/universal/Modal";

interface MataKuliahItem {
  kode: string;
  nama: string;
  sks: number;
  semester: number;
  jenis: string | null;
  deskripsi?: string | null;
}

interface SemesterTabsProps {
  mataKuliah?: MataKuliahItem[];
}

export default function SemesterTabs({ mataKuliah }: SemesterTabsProps) {
  const [activeSemester, setActiveSemester] = useState(1);
  const [selectedMK, setSelectedMK] = useState<MataKuliahItem | null>(null);

  // Group by semester dynamically from Supabase data
  const groupedData = mataKuliah
    ? Array.from({ length: 8 }, (_, i) => {
        const semNum = i + 1;
        return {
          semester: semNum,
          mataKuliah: mataKuliah
            .filter((mk) => mk.semester === semNum)
            .map((mk) => ({
              kode: mk.kode,
              nama: mk.nama,
              sks: mk.sks,
              semester: mk.semester,
              jenis: mk.jenis || "Teori",
              deskripsi: mk.deskripsi || null,
            })),
        };
      })
    : [];

  const semester = groupedData.find((s) => s.semester === activeSemester);
  const totalSKS = semester
    ? semester.mataKuliah.reduce((sum, mk) => sum + mk.sks, 0)
    : 0;

  return (
    <div>
      {/* Semester tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {groupedData.map((sem) => (
          <button
            key={sem.semester}
            onClick={() => setActiveSemester(sem.semester)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeSemester === sem.semester
                ? "bg-accent-400 text-primary-950 shadow-lg shadow-accent-400/10 hover:bg-accent-300"
                : "bg-white/5 text-primary-200 border border-white/10 hover:bg-white/10"
            }`}
          >
            Semester {sem.semester}
          </button>
        ))}
      </div>

      {/* Table */}
      {semester && (
        <div className="animate-fade-in" key={activeSemester}>
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left px-5 py-4.5 font-semibold text-accent-400 text-xs uppercase tracking-wider">
                      No
                    </th>
                    <th className="text-left px-5 py-4.5 font-semibold text-accent-400 text-xs uppercase tracking-wider">
                      Kode MK
                    </th>
                    <th className="text-left px-5 py-4.5 font-semibold text-accent-400 text-xs uppercase tracking-wider">
                      Nama Mata Kuliah
                    </th>
                    <th className="text-center px-5 py-4.5 font-semibold text-accent-400 text-xs uppercase tracking-wider">
                      SKS
                    </th>
                    <th className="text-left px-5 py-4.5 font-semibold text-accent-400 text-xs uppercase tracking-wider">
                      Jenis
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {semester.mataKuliah.map((mk, index) => (
                    <tr
                      key={mk.kode}
                      onClick={() => setSelectedMK(mk)}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      title="Klik untuk detail"
                    >
                      <td className="px-5 py-4 text-primary-300/60">{index + 1}</td>
                      <td className="px-5 py-4 font-mono text-xs text-accent-300 font-semibold">
                        {mk.kode}
                      </td>
                      <td className="px-5 py-4 font-medium text-white">{mk.nama}</td>
                      <td className="px-5 py-4 text-center font-semibold text-accent-300">
                        {mk.sks}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            mk.jenis === "Teori"
                              ? "bg-sky-500/20 text-sky-300 border-sky-500/20"
                              : mk.jenis === "Praktik"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20"
                              : "bg-violet-500/20 text-violet-300 border-violet-500/20"
                          }`}
                        >
                          {mk.jenis}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total SKS */}
            <div className="px-5 py-4.5 bg-white/5 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm font-semibold text-primary-200">
                Total SKS Semester {activeSemester}
              </span>
              <span className="text-xl font-bold text-accent-400">{totalSKS} SKS</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed pop-up Modal */}
      <Modal
        isOpen={!!selectedMK}
        onClose={() => setSelectedMK(null)}
        title={`Detail Mata Kuliah — ${selectedMK?.nama || ""}`}
      >
        {selectedMK && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Kode</p>
                <p className="text-sm font-mono font-bold text-primary-900 mt-0.5">{selectedMK.kode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">SKS</p>
                <p className="text-sm font-bold text-primary-900 mt-0.5">{selectedMK.sks} SKS</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Semester</p>
                <p className="text-sm font-bold text-primary-900 mt-0.5">{selectedMK.semester}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Jenis</p>
                <p className="text-sm font-bold text-primary-900 mt-0.5">{selectedMK.jenis}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Deskripsi</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">
                {selectedMK.deskripsi || "Belum ada deskripsi untuk mata kuliah ini."}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
